import type { BullmqConfigItem } from "@type/config";

/**
 * @Description: 全局类型文件
 */
global {
  interface IEnv {
    PORT: number;
    APP_ROOT: string;
    BULL_BOARD_USERNAME: string;
    BULL_BOARD_PASSWORD_HASH: string;
    BULLMQ_CONFIG: BullmqConfigItem[];
  }
}

export {};
