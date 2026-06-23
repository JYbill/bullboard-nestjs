import fs from "node:fs";
import path from "node:path";
import { Logger, Module, type MiddlewareConsumer, type NestModule, type OnApplicationShutdown } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue, RedisConnection, type RedisOptions } from "bullmq";
import { validateConfig } from "@/config/config.validate.js";
import {
  BULL_BOARD_QUEUE_DELIMITER,
  BULLMQ_REDIS_CONNECT_TIMEOUT_MS,
  BULLMQ_REDIS_PING_INTERVAL_MS,
  BULLMQ_REDIS_SCAN_COUNT,
} from "@/enum/app.enum.js";
import { BasicAuthMiddleware } from "@/middleware/base-auth.middleware.js";
import type { BullmqConfigItem } from "@/config/bullmq.config.d.js";
import type { RedisClientItem, RedisPingClient } from "./app.module.d.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [process.env.NODE_ENV === "production" ? "env/.production.env" : "env/.development.env", "env/.env"],
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: validateConfig,
    }),
  ],
})
export class AppModule implements NestModule, OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name);
  private readonly queueList: Queue[] = [];
  private readonly redisClientList: RedisClientItem[] = [];
  private readonly loggedQueueErrorSet = new WeakSet<Error>();
  private redisPingTimer?: NodeJS.Timeout;
  private isRedisPingRunning = false;

  /** 注入配置服务，用于读取已校验的 BullMQ 面板配置。 */
  constructor(private readonly config: ConfigService<IEnv>) {}

  /** 创建 Bull Board 路由，并把面板挂载到 Nest 中间件链路。 */
  async configure(consumer: MiddlewareConsumer): Promise<void> {
    const configList: BullmqConfigItem[] = this.config.getOrThrow("BULLMQ_CONFIG");

    // 显式配置和 Redis 自动发现都先归一成 Bull Board 适配器列表。
    const queueAdapterList: BullMQAdapter[] = [];
    for (const config of configList) {
      const connectOption = this.buildRedisOptions(config);
      const prefix = config.prefix;
      const bullPrefix = config.bullPrefix;
      const redisClientItem = await this.createRedisClient(connectOption, config);
      let queueNameList: string[];
      try {
        // queues 为空表示以 Redis 当前数据为准，避免配置文件重复维护实际队列列表。
        queueNameList =
          config.queues.length === 0
            ? await this.discoverBullmqQueueNames(redisClientItem.client, bullPrefix)
            : config.queues;
      } catch (error) {
        await this.closeRedisClient(redisClientItem);
        throw error;
      }

      if (queueNameList.length === 0) {
        await this.closeRedisClient(redisClientItem);
        continue;
      }

      this.redisClientList.push(redisClientItem);
      const queues = queueNameList.map((queueName: string) => {
        const queue = new Queue(queueName, { connection: redisClientItem.client, prefix: bullPrefix });
        queue.on("error", (error: Error) => {
          if (this.loggedQueueErrorSet.has(error)) {
            return;
          }

          this.loggedQueueErrorSet.add(error);
          this.logger.warn(
            `BullMQ 队列连接异常，redis=${redisClientItem.label}，queue=${queue.name}，原因 ${error.message}`,
          );
        });
        this.queueList.push(queue);
        // 使用独立分隔符，避免队列名中的连字符被 Bull Board 展示成多级树。
        const adapterOptions =
          prefix === undefined
            ? { delimiter: BULL_BOARD_QUEUE_DELIMITER }
            : { prefix, delimiter: BULL_BOARD_QUEUE_DELIMITER };
        return new BullMQAdapter(queue, adapterOptions);
      });
      queueAdapterList.push(...queues);
    }

    // Bull Board 的静态资源按 basePath 生成，必须和后续挂载路径保持一致。
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/");

    // 这里只需要注册路由的副作用，运行期不动态增删队列。
    const {
      addQueue: _addQueue,
      removeQueue: _removeQueue,
      setQueues: _setQueues,
      replaceQueues: _replaceQueues,
    } = createBullBoard({
      queues: queueAdapterList,
      serverAdapter: serverAdapter,
    });
    // Bull Board 路由和静态资源统一经过基础认证，避免根路径下出现未鉴权入口。
    consumer.apply(BasicAuthMiddleware, serverAdapter.getRouter()).forRoutes("/");
    if (this.redisClientList.length > 0) {
      this.redisPingTimer = setInterval(() => {
        void this.pingRedisConnections();
      }, BULLMQ_REDIS_PING_INTERVAL_MS);
    }
  }

  /** 应用关闭时释放心跳定时器、BullMQ 队列和共享 Redis 连接。 */
  async onApplicationShutdown(): Promise<void> {
    if (this.redisPingTimer !== undefined) {
      clearInterval(this.redisPingTimer);
      this.redisPingTimer = undefined;
    }

    await Promise.allSettled(this.queueList.map((queue) => queue.close()));
    await Promise.allSettled(this.redisClientList.map((redisClientItem) => this.closeRedisClient(redisClientItem)));
  }

  /** 定时探活 Bull Board 持有的 Redis 连接，减少空闲 TLS 连接被中间网络回收后的首包失败。 */
  private async pingRedisConnections(): Promise<void> {
    // 网络超时时单轮心跳可能超过 30 秒，跳过重叠轮次，避免探活请求堆积。
    if (this.isRedisPingRunning) {
      return;
    }

    this.isRedisPingRunning = true;
    try {
      // 同一 Redis 配置只保留一个共享连接，避免每个队列各自 PING 造成瞬时连接压力。
      const pingResultList = await Promise.allSettled(
        this.redisClientList.map(async ({ client }) => {
          await client.ping();
        }),
      );

      for (const [index, pingResult] of pingResultList.entries()) {
        const redisLabel = this.redisClientList[index].label;
        if (pingResult.status === "fulfilled") {
          this.logger.debug(`BullMQ Redis 心跳成功，redis=${redisLabel}`);
          continue;
        }

        const errorMessage = pingResult.reason instanceof Error ? pingResult.reason.message : "未知错误";
        this.logger.warn(`BullMQ Redis 心跳失败，redis=${redisLabel}，原因 ${errorMessage}`);
      }
    } finally {
      this.isRedisPingRunning = false;
    }
  }

  /** 把配置文件里的 Redis 连接字段转换成 ioredis 可识别的连接参数。 */
  private buildRedisOptions(config: BullmqConfigItem): RedisOptions {
    // 基础连接字段按配置原样透传，dbNum 对应 ioredis 的 db。
    const connectOption: RedisOptions = {
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.dbNum,
      connectTimeout: config.timeout ?? BULLMQ_REDIS_CONNECT_TIMEOUT_MS,
    };

    // username 只有非空时才传入，避免空字符串触发 ACL 认证分支。
    const username = config.username?.trim();
    if (username !== undefined && username.length > 0) {
      connectOption.username = username;
    }

    // TLS 证书路径来自配置文件，读取成 Buffer 后交给 ioredis。
    const caPath = config.ca?.trim();
    const clientCertPath = config.clientCert?.trim();
    const clientKeyPath = config.clientKey?.trim();
    if (caPath || clientCertPath || clientKeyPath) {
      connectOption.tls = {
        ca: caPath ? fs.readFileSync(path.resolve(process.cwd(), caPath)) : undefined,
        cert: clientCertPath ? fs.readFileSync(path.resolve(process.cwd(), clientCertPath)) : undefined,
        key: clientKeyPath ? fs.readFileSync(path.resolve(process.cwd(), clientKeyPath)) : undefined,
      };
    }
    return connectOption;
  }

  /** 创建同一配置下所有队列共享的 Redis 客户端。 */
  private async createRedisClient(connectOption: RedisOptions, config: BullmqConfigItem): Promise<RedisClientItem> {
    const label = `${config.host}:${config.port},db=${config.dbNum},prefix=${config.bullPrefix}`;
    const connection = new RedisConnection(connectOption, { blocking: false });
    connection.on("error", (error: Error) => {
      this.logger.warn(`BullMQ Redis 连接异常，redis=${label}，原因 ${error.message}`);
    });
    const client = (await connection.client) as RedisPingClient;
    return { client, connection, label };
  }

  /** 关闭 AppModule 直接持有的共享 Redis 客户端。 */
  private async closeRedisClient(redisClientItem: RedisClientItem): Promise<void> {
    if (redisClientItem.client.status === "end") {
      return;
    }

    try {
      await redisClientItem.connection.close();
    } catch {
      redisClientItem.client.disconnect();
    }
  }

  /** 从 Redis 中发现当前 BullMQ prefix 下已有的队列名称。 */
  private async discoverBullmqQueueNames(redis: RedisPingClient, bullPrefix: string): Promise<string[]> {
    const queueNameSet = new Set<string>();
    let cursor = "0";

    // 使用 SCAN 分批查找队列 meta key，避免启动时用 KEYS 阻塞 Redis。
    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        MATCH: `${bullPrefix}:*:meta`,
        COUNT: BULLMQ_REDIS_SCAN_COUNT,
      });
      cursor = nextCursor;

      // 只从合法 meta key 提取队列名，跳过其它 BullMQ 内部 key。
      for (const key of keys) {
        const queueName = this.parseQueueNameFromMetaKey(key, bullPrefix);
        if (queueName !== undefined) {
          queueNameSet.add(queueName);
        }
      }
    } while (cursor !== "0");

    return Array.from(queueNameSet).sort((firstQueueName, secondQueueName) =>
      firstQueueName.localeCompare(secondQueueName),
    );
  }

  /** 从 BullMQ meta key 中解析普通队列名，非队列 meta key 返回 undefined。 */
  private parseQueueNameFromMetaKey(key: string, bullPrefix: string): string | undefined {
    // BullMQ meta key 形如 <prefix>:<queueName>:meta，带额外分隔符的不按普通队列名处理。
    const keyPrefix = `${bullPrefix}:`;
    const keySuffix = ":meta";
    if (!key.startsWith(keyPrefix) || !key.endsWith(keySuffix)) {
      return undefined;
    }
    const queueName = key.slice(keyPrefix.length, -keySuffix.length);
    if (queueName.length === 0 || queueName.includes(":")) {
      return undefined;
    }
    return queueName;
  }
}
