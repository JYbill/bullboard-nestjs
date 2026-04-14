import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { validateConfig } from "@/config/config.validate";
import { BasicAuthMiddleware } from "@/middleware/base-auth.middleware";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import { ConnectionOptions } from "bullmq/dist/esm/interfaces/redis-options";
import type { BullmqConfigItem } from "@type/config";

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
  constructor(private readonly config: ConfigService<IEnv>) {}

  configure(consumer: MiddlewareConsumer) {
    const configList: BullmqConfigItem[] = this.config.getOrThrow("BULLMQ_CONFIG");

    // 根据queueName列表创建多个队列实例，并包装成Bull Board面板的适配器
    const queueAdapterList: BullMQAdapter[] = [];
    for (const config of configList) {
      const connectOption: ConnectionOptions = {
        host: config.host,
        port: config.port,
        password: config.password,
        db: config.dbNum,
      };
      const prefix = config.prefix;
      const bullPrefix = config.bullPrefix;
      const queues = config.queues.map((queueName: string) => {
        const queue = new Queue(queueName, { connection: connectOption, prefix: bullPrefix });
        // prefix 允许省略，未配置时沿用 Bull Board 默认展示路径。
        const adapterOptions = prefix === undefined ? { delimiter: "-" } : { prefix, delimiter: "-" };
        return new BullMQAdapter(queue, adapterOptions);
      });
      queueAdapterList.push(...queues);
    }

    // 设置url根路径，需要能访问一些包内的静态资源
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/");

    // 创建bullmq board面板实例
    const {
      addQueue: _addQueue,
      removeQueue: _removeQueue,
      setQueues: _setQueues,
      replaceQueues: _replaceQueues,
    } = createBullBoard({
      queues: queueAdapterList,
      serverAdapter: serverAdapter,
    });
    consumer.apply(BasicAuthMiddleware, serverAdapter.getRouter()).forRoutes("/"); // 路径与express访问路径一致
  }
}
