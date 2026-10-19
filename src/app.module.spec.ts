import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigService } from "@nestjs/config";
import type { MiddlewareConsumer } from "@nestjs/common";
import Bull from "bull";
import { Queue, RedisConnection } from "bullmq";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { createBullBoard } from "@bull-board/api";
import { BasicAuthMiddleware } from "@/middleware/base-auth.middleware.js";
import { QueueType } from "@/enum/app.enum.js";
import type { EnvConfig } from "@/config/config.validate.d.js";
import { AppModule } from "./app.module.js";

const mocks = vi.hoisted(() => ({
  legacy: {
    on: vi.fn<(event: string, listener: (error: Error) => void) => void>(),
    isReady: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    client: { ping: vi.fn<() => Promise<string>>().mockResolvedValue("PONG") },
    close: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  },
  modern: {
    on: vi.fn<(event: string, listener: (error: Error) => void) => void>(),
    close: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  },
  redis: {
    status: "ready",
    ping: vi.fn<() => Promise<string>>().mockResolvedValue("PONG"),
    scan: vi.fn<() => Promise<[string, string[]]>>(),
    disconnect: vi.fn<() => void>(),
  },
  connectionClose: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  router: vi.fn<() => void>(),
}));

// 隔离启动配置读取；被测对象通过 ConfigService 接收测试配置，不加载 env 文件。
vi.mock("@nestjs/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@nestjs/config")>();
  return { ...actual, ConfigModule: { forRoot: () => ({ module: actual.ConfigModule }) } };
});
vi.mock("bull", () => ({
  default: vi.fn<() => typeof mocks.legacy>(function () {
    return mocks.legacy;
  }),
}));
vi.mock("bullmq", () => ({
  Queue: vi.fn<() => typeof mocks.modern>(function () {
    return mocks.modern;
  }),
  RedisConnection: vi.fn<
    () => { on: typeof mocks.legacy.on; client: Promise<typeof mocks.redis>; close: typeof mocks.connectionClose }
  >(function () {
    return {
      on: vi.fn<(event: string, listener: (error: Error) => void) => void>(),
      client: Promise.resolve(mocks.redis),
      close: mocks.connectionClose,
    };
  }),
}));
vi.mock("@bull-board/api/bullAdapter", () => ({ BullAdapter: vi.fn<new () => object>(class {}) }));
vi.mock("@bull-board/api/bullMQAdapter", () => ({ BullMQAdapter: vi.fn<new () => object>(class {}) }));
vi.mock("@bull-board/api", () => ({ createBullBoard: vi.fn<() => object>(() => ({})) }));
vi.mock("@bull-board/express", () => ({
  ExpressAdapter: vi.fn<() => { setBasePath: (path: string) => void; getRouter: () => typeof mocks.router }>(
    function () {
      return { setBasePath: vi.fn<(path: string) => void>(), getRouter: () => mocks.router };
    },
  ),
}));

// 只验证应用的协议选择、连接参数和鉴权挂载，不声称覆盖真实 Redis 或 HTTP 链路。
describe("AppModule queue configuration", () => {
  let app: AppModule;
  const config: EnvConfig = {
    PORT: 3000,
    APP_ROOT: "/test",
    BULL_BOARD_USERNAME: "test",
    BULL_BOARD_PASSWORD_HASH: "test-hash",
    BULLMQ_CONFIG: [
      {
        host: "localhost",
        port: 6379,
        password: "",
        dbNum: 2,
        bullPrefix: "legacy",
        prefix: "督导#",
        queueType: QueueType.Bull,
        queues: ["paragraph"],
      },
      {
        host: "localhost",
        port: 6379,
        password: "",
        dbNum: 3,
        bullPrefix: "modern",
        prefix: "微助教#",
        queues: ["paragraph"],
      },
    ],
  };
  const forRoutes = vi.fn<ReturnType<MiddlewareConsumer["apply"]>["forRoutes"]>();
  const apply = vi
    .fn<MiddlewareConsumer["apply"]>()
    .mockReturnValue({ forRoutes, exclude: vi.fn<ReturnType<MiddlewareConsumer["apply"]>["exclude"]>() });
  const consumer: MiddlewareConsumer = {
    apply,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    app = new AppModule(new ConfigService<EnvConfig>(config));
  });

  afterEach(async () => {
    await app.onApplicationShutdown();
    vi.useRealTimers();
  });

  // 目的：防止旧 Bull 配置进入 BullMQ 分支，或丢失 Redis DB 与展示前缀。
  // 总结：两种协议分别创建对应队列和适配器，省略协议仍使用 BullMQ。
  it("selects matching adapters and preserves database and display prefixes", async () => {
    await app.configure(consumer);
    // 期待：Bull 使用独立连接参数；BullMQ 只为自己的配置创建共享连接。
    expect(Bull).toHaveBeenCalledExactlyOnceWith("paragraph", {
      redis: { host: "localhost", port: 6379, password: "", db: 2, connectTimeout: 10000 },
      prefix: "legacy",
    });
    expect(RedisConnection).toHaveBeenCalledExactlyOnceWith(
      { host: "localhost", port: 6379, password: "", db: 3, connectTimeout: 10000 },
      { blocking: false },
    );
    expect(Queue).toHaveBeenCalledExactlyOnceWith("paragraph", { connection: mocks.redis, prefix: "modern" });
    // 期待：适配器按协议分配，展示前缀与树分隔符保留。
    expect(BullAdapter).toHaveBeenCalledExactlyOnceWith(mocks.legacy, { prefix: "督导#", delimiter: "#" });
    expect(BullMQAdapter).toHaveBeenCalledExactlyOnceWith(mocks.modern, { prefix: "微助教#", delimiter: "#" });
    expect(createBullBoard).toHaveBeenCalledWith(
      expect.objectContaining({
        queues: [expect.any(BullAdapter), expect.any(BullMQAdapter)],
        options: { uiConfig: { hideRedisDetails: true } },
      }),
    );
  });

  // 目的：防止面板路由或静态资源绕过基础认证。
  // 总结：认证中间件先于面板路由注册，并覆盖根路径。
  it("registers authentication before the dashboard router", async () => {
    await app.configure(consumer);
    // 期待：所有面板请求先经过认证，再进入路由。
    expect(apply).toHaveBeenCalledExactlyOnceWith(BasicAuthMiddleware, mocks.router);
    expect(forRoutes).toHaveBeenCalledExactlyOnceWith("/");
  });

  // 目的：防止应用关闭后遗留队列连接或心跳定时器。
  // 总结：两种队列和 BullMQ 共享连接都被关闭，心跳停止。
  it("closes both queue types and stops the shared connection heartbeat", async () => {
    await app.configure(consumer);
    await app.onApplicationShutdown();
    await vi.advanceTimersByTimeAsync(30000);
    // 期待：资源关闭一次，关闭后不再发送心跳。
    expect(mocks.legacy.close).toHaveBeenCalledTimes(1);
    expect(mocks.modern.close).toHaveBeenCalledTimes(1);
    expect(mocks.connectionClose).toHaveBeenCalledTimes(1);
    expect(mocks.redis.ping).not.toHaveBeenCalled();
  });
});
