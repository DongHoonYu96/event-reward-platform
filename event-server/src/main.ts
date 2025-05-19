import { NestFactory } from '@nestjs/core';
import {Logger, ValidationPipe} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import {MicroserviceOptions, RmqOptions, TcpOptions, Transport} from "@nestjs/microservices";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true, //
  }));

  const config = new DocumentBuilder()
      .setTitle('Event Service API')
      .setDescription('이벤트 서비스 API 문서')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const options : RmqOptions = {
    transport: Transport.RMQ,
    options: {
      urls: configService.getOrThrow('RABBITMQ_URI'),
      queue: 'event',
    },
  };



  const port = configService.get('port');

  app.connectMicroservice<MicroserviceOptions>(options);
  await app.startAllMicroservices();
  await app.listen(port);

  Logger.log(
      `🚀 Event Application is running on: TCP ${JSON.stringify(
          options,
      )} with http ${port} port`,
      'bootstrap-hybrid',
  );
}
bootstrap();