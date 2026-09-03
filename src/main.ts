import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { Logger, StandardSchemaValidationPipe, VersioningType } from "@nestjs/common";
import type { EnvConfig } from "@/config/config.validate.d.js";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.enableShutdownHooks();
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  const logger = new Logger(bootstrap.name);
  const configService = app.get(ConfigService<EnvConfig>);
  const port = configService.getOrThrow<number>("PORT");
  app.set("trust proxy", true);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.listen(port || 3000);
  logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}
void bootstrap();
