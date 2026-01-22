/**
 * @Description: 全局类型文件
 */
global {
  interface IEnv {
    // .env环境变量
    PORT: number;

    // redis
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;
    REDIS_DB: number;

    // bullmq
    BULL_QUEUE: string;
    BULL_PREFIX: string;
  }
}

export {};
