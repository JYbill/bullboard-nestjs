import fs from "node:fs";
import path from "node:path";
import { plainToInstance } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNumber, IsString, validateSync } from "class-validator";
import { type BullmqConfigItem } from "@type/config";

const BULLMQ_CONFIG_RELATIVE_PATH = "env/bullmq.config.json";

class BullmqConfigEntity implements BullmqConfigItem {
  @IsString()
  host: string;

  @IsNumber()
  port: number;

  @IsString()
  password: string;

  @IsNumber()
  dbNum: number;

  @IsString()
  prefix: string;

  @IsString()
  bullPrefix: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  queues: string[];
}

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

  let parsedConfig = [];
  try {
    parsedConfig = JSON.parse(configContent);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    throw new Error(`解析 BullMQ 配置文件失败 ${configFilePath}，原因 ${errorMessage}`);
  }

  if (!Array.isArray(parsedConfig)) {
    throw new Error(`BullMQ 配置文件必须是 JSON 数组 ${configFilePath}`);
  }

  if (parsedConfig.length === 0) {
    throw new Error(`BullMQ 配置文件至少要包含一项队列配置 ${configFilePath}`);
  }

  const configItemList = plainToInstance(BullmqConfigEntity, parsedConfig, {
    enableImplicitConversion: false,
  });

  for (const [index, configItem] of configItemList.entries()) {
    const errors = validateSync(configItem);
    if (errors.length > 0) {
      throw new Error(`BullMQ 配置文件第 ${index + 1} 项校验失败 ${configFilePath}，详情 ${errors.toString()}`);
    }
  }

  return configItemList;
}
