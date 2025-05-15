import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {AuthProxyController} from "./auth-proxy.controller";
import {AuthProxyService} from "./auth-proxy.service";
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
        ClientsModule.registerAsync([
            {
                name: 'AUTH_SERVICE',
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('AUTH_SERVICE_HOST'),
                        port: +configService.get('AUTH_SERVICE_PORT'), //
                    },
                }),
            },
        ]),
    ],
    controllers: [AuthProxyController],
    providers: [
        AuthProxyService,
        {
            provide: 'AUTH_SERVICE_URL',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return configService.get<string>('AUTH_SERVICE_URL');
            },
        },
    ],
    exports: [AuthProxyService],
})
export class AuthProxyModule {}