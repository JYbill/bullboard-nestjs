/**
 * @Description: Config Module 校验配置变量
 */
import { Expose, plainToInstance } from "class-transformer";
import { IsNumber, IsString, validateSync } from "class-validator";
import path from "node:path";

class EnvConfig implements IEnv {
  @IsNumber()
  @Expose()
  PORT: number;

  @IsString()
  @Expose()
  APP_ROOT: string;

  @IsString()
  @Expose()
  REDIS_HOST: string;

  @IsNumber()
  @Expose()
  REDIS_PORT: number;

  @IsString()
  @Expose()
  REDIS_PASSWORD: string;

  @IsString()
  @Expose()
  BULL_QUEUE: string;

  @IsString()
  @Expose()
  BULL_PREFIX: string;

  @IsNumber()
  @Expose()
  REDIS_DB: number;
}

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
  return validatedConfig;
}
