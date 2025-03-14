import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { Logger, VersioningType } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const logger = new Logger(bootstrap.name);
  const configService = app.get(ConfigService<IEnv>);
  const port = configService.getOrThrow<number>("PORT");
  app.set("trust proxy", true);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.listen(port || 3000);
  logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}
void bootstrap();
