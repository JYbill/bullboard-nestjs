import fs from "node:fs";
import path from "node:path";
import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue, RedisConnection, type RedisOptions } from "bullmq";
import { validateConfig } from "@/config/config.validate.js";
import { BULL_BOARD_QUEUE_DELIMITER, BULLMQ_REDIS_CONNECT_TIMEOUT_MS } from "@/enum/app.enum.js";
import { BasicAuthMiddleware } from "@/middleware/base-auth.middleware.js";
import type { BullmqConfigItem } from "@/config/bullmq.config.d.js";

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
export class AppModule implements NestModule {
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
      // queues 为空表示以 Redis 当前数据为准，避免配置文件重复维护实际队列列表。
      const queueNameList =
        config.queues.length === 0 ? await this.discoverBullmqQueueNames(connectOption, bullPrefix) : config.queues;
      const queues = queueNameList.map((queueName: string) => {
        const queue = new Queue(queueName, { connection: connectOption, prefix: bullPrefix });
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

  /** 从 Redis 中发现当前 BullMQ prefix 下已有的队列名称。 */
  private async discoverBullmqQueueNames(connectOption: RedisOptions, bullPrefix: string): Promise<string[]> {
    const redisConnection = new RedisConnection(connectOption);
    const queueNameSet = new Set<string>();
    let cursor = "0";

    // 使用 SCAN 分批查找队列 meta key，避免启动时用 KEYS 阻塞 Redis。
    try {
      const redis = await redisConnection.client;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, {
          MATCH: `${bullPrefix}:*:meta`,
          COUNT: 100,
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
    } finally {
      await redisConnection.close();
    }
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
