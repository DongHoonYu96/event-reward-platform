import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {AuthProxyController} from "./auth-proxy.controller";
import {AuthProxyService} from "./auth-proxy.service";

@Module({
    imports: [
        HttpModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                timeout: configService.get('HTTP_TIMEOUT', 5000),
                maxRedirects: configService.get('HTTP_MAX_REDIRECTS', 5),
            }),
        }),
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