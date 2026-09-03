import path from "node:path";
import { z } from "zod";
import { loadBullmqConfig } from "./bullmq.config.js";

/** 校验环境变量，并在启动阶段预加载 BullMQ 配置文件。 */
export const envConfigSchema = z
  .object({
    PORT: z.coerce.number(),
    BULL_BOARD_USERNAME: z.string(),
    BULL_BOARD_PASSWORD_HASH: z.string(),
  })
  .transform((config) => {
    const appRoot = path.resolve(process.cwd());
    return {
      ...config,
      APP_ROOT: appRoot,
      BULLMQ_CONFIG: loadBullmqConfig(appRoot),
    };
  });
