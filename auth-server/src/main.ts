import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, RmqOptions, Transport} from "@nestjs/microservices";
import {Logger, ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const config = new DocumentBuilder()
      .setTitle('Auth Service API')
      .setDescription('인증 서비스 API 문서')
      .setVersion('1.0')
      .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth', // 이 이름은 컨트롤러의 @ApiBearerAuth() 데코레이터와 일치해야 함
      )
      .addServer('/AUTH-SERVICE')
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const options : RmqOptions = {
    transport: Transport.RMQ,
    options: {
      urls: configService.getOrThrow('RABBITMQ_URI'),
      queue: 'auth',
    },
  };

  const port = configService.get('port');

  app.connectMicroservice<MicroserviceOptions>(options);
  await app.startAllMicroservices();
  await app.listen(port);

  Logger.log(
      `🚀 Auth Application is running on: TCP ${JSON.stringify(
          options,
      )} with http ${port} port`,
      'bootstrap-hybrid',
  );

}
bootstrap();
