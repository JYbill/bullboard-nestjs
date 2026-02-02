/**
 * Bullmq队列配置项
 */
export type BullmqConfigItem = {
  host: string;
  port: number;
  password: string;
  dbNum: number;
  prefix: string;
  bullPrefix: string;
  queues: string[];
};
