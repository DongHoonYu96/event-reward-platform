import {
    Controller,
    All,
    Body,
    Headers,
    Query,
    Req,
    UseGuards,
    Post,
    Get,
    Logger,
    HttpStatus,
    HttpException,
    Inject
} from '@nestjs/common';

import { AuthProxyService } from './auth-proxy.service';
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { IsPublic } from "../../../common/decorators/is-public.decorator";
import { Roles, UserRole } from "../../../common/decorators/roles.decorator";
import { ClientProxy } from "@nestjs/microservices";

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthProxyController {
    private readonly logger = new Logger(AuthProxyController.name);
    constructor(
        private readonly authProxyService: AuthProxyService,
        @Inject('AUTH_SERVICE')
        private readonly authProxy: ClientProxy,
    ) {}

    @Get('health')
    @IsPublic()
    healthCheck() {
        return "OK";
    }

    @IsPublic()
    @Post('login')
    async login(@Body() body) {
        return this.authProxy.send({ cmd: 'login' }, body);
    }

    @IsPublic()
    @Post('register')
    async register(@Body() body) {
        return this.authProxy.send({ cmd: 'register' }, body);
    }

    @Get('users/profile')
    async getProfile(@Req() req) {
        return this.authProxy.send(
            { cmd: 'get_profile' },req.user.userId
        );
    }

    @Roles(UserRole.ADMIN)
    @All('users*')
    adminUserRoutes(@Req() req, @Body() body, @Headers() headers, @Query() query) {
        const path = req.url.replace(/^\/auth\//, '');
        return this.authProxyService.forwardRequest(
            req.method,
            path,
            body,
            this.addUserToHeaders(req, headers),
            query,
        );
    }

    private prepareHeaders(headers: any) {
        // 클라이언트 IP 등을 제거
        const { host, ...rest } = headers;
        return rest;
    }

    private addUserToHeaders(req: any, headers: any) {
        const preparedHeaders = this.prepareHeaders(headers);
        if (req.user) {
            preparedHeaders['X-User-Id'] = req.user.userId;
            preparedHeaders['X-User-Role'] = req.user.role;
        }
        return preparedHeaders;
    }
}