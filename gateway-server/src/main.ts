import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {Logger} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const logger = new Logger('GatewayServer');

  // Swagger 설정
  const config = new DocumentBuilder()
      .setTitle('Event Reward Platform API')
      .setDescription('이벤트/보상 관리 시스템 API 문서')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

  const document = SwaggerModule.createDocument(app, config);

  // 각 서비스의 Swagger 문서 URL 설정
  const options = {
    explorer: true,
    swaggerOptions: {
      urls: [
        {
          url: '/AUTH-SERVICE/api-json',
          name: 'Auth Service'
        },
        {
          url: '/EVENT-SERVICE/api-json',
          name: 'Event Service'
        }
      ]
    }
  };

  SwaggerModule.setup('api', app, document, options);

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
  logger.log(`Gateway Server is running on port ${port}`);
}
bootstrap();
