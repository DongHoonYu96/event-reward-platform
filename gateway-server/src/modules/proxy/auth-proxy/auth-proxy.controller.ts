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
    HttpException
} from '@nestjs/common';

import { AuthProxyService } from './auth-proxy.service';
import {JwtAuthGuard} from "../../../common/guards/jwt-auth.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {IsPublic} from "../../../common/decorators/is-public.decorator";
import {Roles, UserRole} from "../../../common/decorators/roles.decorator";
import axios from "axios";


@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthProxyController {
    private readonly logger = new Logger(AuthProxyController.name);
    constructor(private readonly authProxyService: AuthProxyService) {}

    @Get('health')
    @IsPublic()
    healthCheck(){
        return "OK";
    }

    @IsPublic()
    @Post('login')
    async login(@Req() req, @Body() body, @Headers() headers, @Query() query) {
        const path = req.url.replace(/^\/auth\//, '');
        this.logger.log(`[AuthProxyController] login: ${req.method} ${path}`);
        try {
            const response = await axios.post(
                'http://localhost:3001/users/login',
                body,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                }
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Login failed: ${error.message}`);

            // Auth 서버에서 보낸 오류 응답이 있는 경우
            if (error.response) {
                this.logger.debug(`Auth server error: ${JSON.stringify(error.response.data)}`);

                // 원본 상태 코드와 응답 데이터 그대로 전달
                throw new HttpException(
                    error.response.data,
                    error.response.status
                );
            }

            // 네트워크 오류 등 다른 오류 처리
            throw new HttpException(
                '인증 서비스 연결 중 오류가 발생했습니다.',
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    @IsPublic()
    @All('register')
    register(@Req() req, @Body() body, @Headers() headers, @Query() query) {
        const path = req.url.replace(/^\/auth\//, '');
        return this.authProxyService.forwardRequest(
            req.method,
            path,
            body,
            this.prepareHeaders(headers),
            query,
        );
    }

    @All('users/profile')
    getProfile(@Req() req, @Body() body, @Headers() headers, @Query() query) {
        const path = req.url.replace(/^\/auth\//, '');
        return this.authProxyService.forwardRequest(
            req.method,
            path,
            body,
            this.addUserToHeaders(req, headers),
            query,
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