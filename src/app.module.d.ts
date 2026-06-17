import type { Queue } from "bullmq";

/** 可发送 Redis PING 的 BullMQ Redis 客户端。 */
export type RedisPingClient = Awaited<ReturnType<Queue["waitUntilReady"]>> & {
  ping(): Promise<string>;
};
