import { NestFactory } from '@nestjs/core';
import {Logger, ValidationPipe} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import {MicroserviceOptions, RmqOptions, TcpOptions, Transport} from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true, //
  }));

  // const options : TcpOptions = {
  //   transport: Transport.TCP,
  //   options: {
  //     host: configService.get('MS_HOST'),
  //     port: +configService.get('MS_PORT'),
  //   },
  // };

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
  // await app.listen(port);

  Logger.log(
      `🚀 Event Application is running on: TCP ${JSON.stringify(
          options,
      )} with http ${port} port`,
      'bootstrap-hybrid',
  );
}
bootstrap();