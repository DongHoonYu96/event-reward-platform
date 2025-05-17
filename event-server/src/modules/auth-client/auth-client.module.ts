import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ClientsModule.registerAsync([
            // {
            //     name: 'AUTH_SERVICE',
            //     imports: [ConfigModule],
            //     inject: [ConfigService],
            //     useFactory: (configService: ConfigService) => ({
            //         transport: Transport.TCP,
            //         options: {
            //             host: configService.get('AUTH_SERVICE_HOST'),
            //             port: +configService.get('AUTH_SERVICE_PORT'),
            //         },
            //     }),
            // },
            {
                name: 'AUTH_SERVICE',
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: configService.getOrThrow('RABBITMQ_URI'),
                        queue: 'auth',
                    },
                }),
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class AuthClientModule {}