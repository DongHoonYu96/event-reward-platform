import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {APP_GUARD} from "@nestjs/core";
import {JwtAuthGuard} from "./common/guards/jwt-auth.guard";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./modules/strategies/jwt.strategy";
import {AuthProxyModule} from "./modules/proxy/auth-proxy/auth-proxy.module";
import {
  ClientOptions,
  ClientProxyFactory,
  ClientsModule,
  TcpClientOptions,
  TcpOptions,
  Transport
} from "@nestjs/microservices";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
    }),
    AuthProxyModule
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
  }
}