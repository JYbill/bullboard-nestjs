import { createHash } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import Bull from "bull";
import { Queue } from "bullmq";
import request from "supertest";
import { AppModule } from "./app.module.js";

// 仅连接显式启动的本机独立 Redis，避免测试读写开发配置中的共享服务。
const testPort = Number(process.env.BULLBOARD_TEST_REDIS_PORT);
describe.skipIf(!testPort)("Bull and BullMQ dashboard", () => {
  let app: INestApplication;
  let oldQueue: Bull.Queue;
  let newQueue: Queue;
  const password = "isolated-test-password";
  const prefix = `board-test-${process.pid}`;
  const redis = { host: "127.0.0.1", port: testPort, password: "", db: 0 };

  beforeAll(async () => {
    oldQueue = new Bull("paragraph", { redis, prefix });
    newQueue = new Queue("paragraph", { connection: { ...redis, db: 1 }, prefix });
    await oldQueue.add({ protocol: "bull" }, { jobId: "legacy-job" });
    await newQueue.add("generate", { protocol: "bullmq" }, { jobId: "modern-job" });
    const config = new ConfigService({
      BULL_BOARD_USERNAME: "test",
      BULL_BOARD_PASSWORD_HASH: createHash("sha256").update(password).digest("hex"),
      BULLMQ_CONFIG: [
        { ...redis, dbNum: 0, bullPrefix: prefix, prefix: "督导#", queueType: "bull", queues: ["paragraph"] },
        { ...redis, dbNum: 1, bullPrefix: prefix, prefix: "微助教#", queues: ["paragraph"] },
      ],
    });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService)
      .useValue(config)
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await oldQueue?.obliterate({ force: true });
    await newQueue?.obliterate({ force: true });
    await oldQueue?.close();
    await newQueue?.close();
  });

  it("keeps grouped names and reads jobs with the matching protocol", async () => {
    const http = request(app.getHttpServer() as Server);
    const legacy = await http
      .get("/api/queues")
      .auth("test", password)
      .query({ activeQueue: "督导#paragraph", status: "waiting", page: 1 });
    expect(legacy.status).toBe(200);
    expect(legacy.body.queues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "督导#paragraph",
          type: "bull",
          jobs: expect.arrayContaining([expect.objectContaining({ id: "legacy-job", data: { protocol: "bull" } })]),
        }),
        expect.objectContaining({ name: "微助教#paragraph", type: "bullmq" }),
      ]),
    );
    const modern = await http
      .get("/api/queues")
      .auth("test", password)
      .query({ activeQueue: "微助教#paragraph", status: "waiting", page: 1 });
    expect(modern.status).toBe(200);
    expect(modern.body.queues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "微助教#paragraph",
          jobs: expect.arrayContaining([expect.objectContaining({ id: "modern-job", data: { protocol: "bullmq" } })]),
        }),
      ]),
    );
  });

  it("requires authentication for both queue types", async () => {
    const response = await request(app.getHttpServer() as Server).get("/api/queues");
    expect(response.status).toBe(401);
  });
});
