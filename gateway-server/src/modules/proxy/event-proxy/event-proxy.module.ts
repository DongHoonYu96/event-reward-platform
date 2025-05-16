import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ClaimsProxyController } from "./claims-proxy.controller";
import { EventsProxyController } from "./events-proxy.controller";

@Module({
    imports: [
        HttpModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                timeout: configService.get('HTTP_TIMEOUT', 5000),
                maxRedirects: configService.get('HTTP_MAX_REDIRECTS', 5),
            }),
        }),
        ClientsModule.registerAsync([
            {
                name: 'EVENT_SERVICE',
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('EVENT_SERVICE_HOST'),
                        port: +configService.get('EVENT_SERVICE_PORT'),
                    },
                }),
            },
        ]),
    ],
    controllers: [ClaimsProxyController, EventsProxyController],
    exports: [ClientsModule],
})
export class EventProxyModule {}