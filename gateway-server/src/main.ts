import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {Logger} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const logger = new Logger('HTTP');

  // 전역 로깅 미들웨어
  app.use((req, res, next) => {
    const start = Date.now();
    const { method, originalUrl } = req;

    logger.log(`${method} ${originalUrl} - Request received`);

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.log(`${method} ${originalUrl} - Response: ${res.statusCode}, Duration: ${duration}ms`);
    });

    next();
  });

  app.enableCors();

  const port = configService.get<number>('PORT', 8080);
  await app.listen(port);
  console.log(`Gateway Server is running on port ${port}`);
}
bootstrap();
