import { NestFactory } from '@nestjs/core';
import {Logger, ValidationPipe} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('HTTP');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.enableCors();

  const port = configService.get<number>('PORT', 3002);
  await app.listen(port);
  logger.log(`Event Server is running on port ${port}`);
}
bootstrap();