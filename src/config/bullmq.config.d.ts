/**
 * Bullmq队列配置项
 */
export type BullmqConfigItem = {
  host: string;
  port: number;
  password: string;
  username?: string;
  ca?: string;
  clientCert?: string;
  clientKey?: string;
  dbNum: number;
  prefix?: string;
  bullPrefix: string;
  timeout?: number;
  queues: string[];
};
