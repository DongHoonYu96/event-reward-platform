import { NestFactory } from '@nestjs/core';
import {INestApplication, Logger, ValidationPipe} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import {MicroserviceOptions, RmqOptions, Transport} from "@nestjs/microservices";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

function setUpSwaggerConfig(app: INestApplication<any>) {
    const config = new DocumentBuilder()
        .setTitle('Event Service API')
        .setDescription('이벤트 서비스 API 문서')
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
        .addServer('/EVENT-SERVICE')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

    setUpSwaggerConfig(app);

    const options : RmqOptions = {
    transport: Transport.RMQ,
    options: {
      urls: configService.getOrThrow('RABBITMQ_URI'),
      queue: 'event',
    },
  };

  const port = configService.get('port');

  const iNestMicroservice = app.connectMicroservice<MicroserviceOptions>(options);
    iNestMicroservice.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

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