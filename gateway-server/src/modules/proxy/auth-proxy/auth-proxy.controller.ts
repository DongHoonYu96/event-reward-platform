import {
    Controller,
    Body,
    Req,
    UseGuards,
    Post,
    Get,
    Logger,
    Inject, HttpCode, HttpStatus
} from '@nestjs/common';

import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { IsPublic } from "../../../common/decorators/is-public.decorator";
import { Roles, UserRole } from "../../../common/decorators/roles.decorator";
import { ClientProxy } from "@nestjs/microservices";

@Controller('AUTH-SERVICE')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthProxyController {
    private readonly logger = new Logger(AuthProxyController.name);
    constructor(
        @Inject('AUTH_SERVICE')
        private readonly authProxy: ClientProxy,
    ) {}

    @Get('health')
    @IsPublic()
    healthCheck() {
        return "OK";
    }

    @IsPublic()
    @HttpCode(HttpStatus.OK)
    @Post('users/login')
    async login(@Body() body) {
        this.logger.log(`Login attempt: ${body.username}`);
        return this.authProxy.send({ cmd: 'login' }, body);
    }

    @IsPublic()
    @Post('users/register')
    async register(@Body() body) {
        this.logger.log(`Register user: ${body.username}`);
        return this.authProxy.send({ cmd: 'register' }, body);
    }

    @Get('users/profile')
    async getProfile(@Req() req) {
        this.logger.log(`Get profile for user: ${req.user.userId}`);
        return this.authProxy.send(
            { cmd: 'get_profile' },req.user.userId
        );
    }

    @Roles(UserRole.ADMIN)
    @Get('users/admin-only')
    adminOnly(@Req() req) {
        this.logger.log(`Admin only access from: ${req.user.userId}`);
        return this.authProxy.send(
            { cmd: 'admin_only' },
            { userId: req.user.userId, role: req.user.role }
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