import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { BullmqConfigItem } from "./bullmq.config.d.js";

const BULLMQ_CONFIG_RELATIVE_PATH = "env/bullmq.config.json";

/** 单项 BullMQ 连接与队列配置 Schema。 */
export const bullmqConfigItemSchema = z
  .object({
    host: z.string(),
    port: z.number(),
    password: z.string(),
    username: z.string().optional(),
    ca: z.string().optional(),
    clientCert: z.string().optional(),
    clientKey: z.string().optional(),
    dbNum: z.number(),
    prefix: z.string().optional(),
    bullPrefix: z.string(),
    timeout: z.number().optional(),
    queues: z.array(z.string()),
  })
  .superRefine((config, context) => {
    const hasClientCert = config.clientCert !== undefined && config.clientCert.trim().length > 0;
    const hasClientKey = config.clientKey !== undefined && config.clientKey.trim().length > 0;
    if (hasClientCert === hasClientKey) {
      return;
    }

    const missingConfigName = hasClientCert ? "clientKey" : "clientCert";
    context.addIssue({
      code: "custom",
      path: [missingConfigName],
      message: `clientCert 和 clientKey 必须同时填写或同时留空，缺少 ${missingConfigName}`,
    });
  });

/** 读取并校验 BullMQ 队列配置文件。 */
export function loadBullmqConfig(appRoot: string): BullmqConfigItem[] {
  const configFilePath = path.resolve(appRoot, BULLMQ_CONFIG_RELATIVE_PATH);
  let configContent = "";

  try {
    configContent = fs.readFileSync(configFilePath, "utf8");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    throw new Error(`读取 BullMQ 配置文件失败 ${configFilePath}，原因 ${errorMessage}`);
  }

  let parsedConfig: object | string | number | boolean | null;
  try {
    parsedConfig = JSON.parse(configContent) as object | string | number | boolean | null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    throw new Error(`解析 BullMQ 配置文件失败 ${configFilePath}，原因 ${errorMessage}`);
  }

  if (!Array.isArray(parsedConfig)) {
    throw new Error(`BullMQ 配置文件必须是 JSONC 数组 ${configFilePath}`);
  }

  if (parsedConfig.length === 0) {
    throw new Error(`BullMQ 配置文件至少要包含一项队列配置 ${configFilePath}`);
  }

  const configItemList: BullmqConfigItem[] = [];
  for (const [index, configItem] of parsedConfig.entries()) {
    const result = bullmqConfigItemSchema.safeParse(configItem);
    if (!result.success) {
      throw new Error(
        `BullMQ 配置文件第 ${index + 1} 项校验失败 ${configFilePath}，详情 ${z.prettifyError(result.error)}`,
      );
    }
    configItemList.push(result.data);
  }

  return configItemList;
}
