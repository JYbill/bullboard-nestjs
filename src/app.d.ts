/**
 * @Description: 全局类型文件
 */
declare global {
  declare interface IEnv {
    // .env环境变量
    PORT: number;

    // redis
    REDIS_PREFIX: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;

    // bullmq
    BULL_QUEUE: string;
    BULL_PREFIX: string;
  }
}

export {};
