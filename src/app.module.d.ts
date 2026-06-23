import type { RedisClient, RedisConnection } from "bullmq";

/** BullMQ 内部 Redis 客户端，运行期由 ioredis 提供 PING 能力。 */
export type RedisPingClient = RedisClient & {
  ping(): Promise<string>;
};

/** AppModule 持有的共享 Redis 客户端。 */
export type RedisClientItem = {
  client: RedisPingClient;
  connection: RedisConnection;
  label: string;
};
