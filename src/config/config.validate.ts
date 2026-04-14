/**
 * @Description: Config Module 校验配置变量
 */
import path from "node:path";
import { Expose, plainToInstance } from "class-transformer";
import { IsNumber, IsString, validateSync } from "class-validator";
import { loadBullmqConfig } from "@/config/bullmq.config";
import { type BullmqConfigItem } from "@type/config";

class EnvConfig implements IEnv {
  @IsNumber()
  @Expose()
  PORT: number;

  @IsString()
  @Expose()
  APP_ROOT: string;

  @IsString()
  @Expose()
  BULL_BOARD_USERNAME: string;

  @IsString()
  @Expose()
  BULL_BOARD_PASSWORD_HASH: string;

  BULLMQ_CONFIG: BullmqConfigItem[];
}

/** 校验环境变量并预加载 BullMQ 配置文件。 */
export function validateConfig(config: Record<string, unknown>) {
  // 字面量对象 -> class，开启隐式转换
  const validatedConfig = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
  // 跳过未定义的属性
  const errors = validateSync(validatedConfig, { skipMissingProperties: true });
  if (errors.length > 0) {
    console.log(errors);
    throw new Error(errors.toString());
  }

  validatedConfig.APP_ROOT = path.resolve(__dirname, "../../");
  // 启动期先读取 JSON 文件，后续统一从 ConfigService 里获取。
  validatedConfig.BULLMQ_CONFIG = loadBullmqConfig(validatedConfig.APP_ROOT);
  return validatedConfig;
}
