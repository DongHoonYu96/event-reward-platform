import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, TcpOptions, Transport} from "@nestjs/microservices";
import {Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const options : TcpOptions = {
    transport: Transport.TCP,
    options: {
      host: configService.get('MS_HOST'),
      port: +configService.get('MS_PORT'),
    },
  };
  const port = configService.get('port');

  app.connectMicroservice<MicroserviceOptions>(options);
  await app.startAllMicroservices();
  // await app.listen(port);

  Logger.log(
      `🚀 Auth Application is running on: TCP ${JSON.stringify(
          options,
      )} with http ${port} port`,
      'bootstrap-hybrid',
  );

}
bootstrap();
