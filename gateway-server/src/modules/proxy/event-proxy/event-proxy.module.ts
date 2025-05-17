import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ClaimsProxyController } from "./claims-proxy.controller";
import { EventsProxyController } from "./events-proxy.controller";
import {RewardsProxyController} from "./rewards-proxy.controller";

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
        //         name: 'EVENT_SERVICE',
        //         inject: [ConfigService],
        //         useFactory: (configService: ConfigService) => ({
        //             transport: Transport.TCP,
        //             options: {
        //                 host: configService.get('EVENT_SERVICE_HOST'),
        //                 port: +configService.get('EVENT_SERVICE_PORT'),
        //             },
        //         }),
        //     },
        // ]),
        ClientsModule.registerAsync([
            {
                name: 'EVENT_SERVICE',
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: configService.getOrThrow('RABBITMQ_URI'),
                        queue: 'event',
                    },
                }),
            },
        ]),
    ],
    controllers: [ClaimsProxyController, EventsProxyController, RewardsProxyController],
    exports: [ClientsModule],
})
export class EventProxyModule {}