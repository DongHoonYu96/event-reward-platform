import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {AuthProxyController} from "./auth-proxy.controller";
import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
    imports: [
        HttpModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                timeout: configService.get('HTTP_TIMEOUT', 5000),
                maxRedirects: configService.get('HTTP_MAX_REDIRECTS', 5),
            }),
        }),
        // ClientsModule.registerAsync([
        //     {
        //         name: 'AUTH_SERVICE',
        //         inject: [ConfigService],
        //         useFactory: (configService: ConfigService) => ({
        //             transport: Transport.TCP,
        //             options: {
        //                 host: configService.get('AUTH_SERVICE_HOST'),
        //                 port: +configService.get('AUTH_SERVICE_PORT'), //
        //             },
        //         }),
        //     },
        // ]),
        ClientsModule.registerAsync([
            {
                name: 'AUTH_SERVICE',
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
    controllers: [AuthProxyController],
    exports: [ClientsModule],
})
export class AuthProxyModule {}