/**
 * @Description: 全局类型文件
 */
global {
  interface IEnv {
    PORT: number;
    BULL_BOARD_USERNAME: string;
    BULL_BOARD_PASSWORD_HASH: string;
    BULL_QUEUES: string;
  }
}

export {};
