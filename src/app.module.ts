import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { validateConfig } from "@/common/config/config.validate";
import { Queue } from "bullmq";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

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
  constructor(private readonly configService: ConfigService<IEnv>) {}

  configure(consumer: MiddlewareConsumer) {
    const redisHost = this.configService.getOrThrow("REDIS_HOST");
    const redisPort = this.configService.getOrThrow("REDIS_PORT");
    const redisPwd = this.configService.getOrThrow("REDIS_PASSWORD");
    const bullPrefix = this.configService.getOrThrow("BULL_PREFIX");
    const queueNameListJSON = this.configService.getOrThrow("BULL_QUEUE");
    const queueNameList = JSON.parse(queueNameListJSON) as string[];

    // 根据queueName列表创建多个队列实例，并包装成Bull Board面板的适配器
    const queueAdapterList = queueNameList.map((queueName) => {
      const queue = new Queue(queueName, {
        connection: {
          host: redisHost,
          port: redisPort,
          password: redisPwd,
        },
        prefix: bullPrefix,
      });
      return new BullMQAdapter(queue);
    });

    // 设置url根路径，需要能访问一些包内的静态资源
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/");
    const {
      addQueue: _addQueue,
      removeQueue: _removeQueue,
      setQueues: _setQueues,
      replaceQueues: _replaceQueues,
    } = createBullBoard({
      queues: queueAdapterList,
      serverAdapter: serverAdapter,
    });
    consumer.apply(serverAdapter.getRouter()).forRoutes("/"); // 路径与express访问路径一致
  }
}
