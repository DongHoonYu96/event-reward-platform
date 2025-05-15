import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();

  const port = configService.get<number>('PORT', 8080);
  await app.listen(port);
  console.log(`Auth Server is running on port ${port}`);
}
bootstrap();
