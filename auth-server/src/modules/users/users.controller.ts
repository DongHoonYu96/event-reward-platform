import {Controller, Get, Logger, Post, Body, UseGuards, Request} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import {MessagePattern, Payload, RpcException} from '@nestjs/microservices';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth} from "@nestjs/swagger";

@ApiTags('인증')
@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);
    constructor(private readonly usersService: UsersService) {}

    // HTTP 엔드포인트 추가
    @ApiOperation({ summary: '회원가입' })
    @ApiResponse({
        status: 201,
        description: '회원가입 성공',
        schema: {
            properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
            }
        }
    })
    @Post('register')
    async registerHttp(@Body() createUserDto: CreateUserDto) {
        return this.register(createUserDto);
    }

    @ApiOperation({ summary: '로그인' })
    @ApiResponse({
        status: 200,
        description: '로그인 성공',
        schema: {
            properties: {
                access_token: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' }
                    }
                }
            }
        }
    })
    @Post('login')
    async loginHttp(@Body() loginUserDto: LoginUserDto) {
        return this.login(loginUserDto);
    }

    @ApiOperation({ summary: '사용자 정보 조회' })
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: '사용자 정보 조회 성공',
        schema: {
            properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
            }
        }
    })

    @Get('info')
    async getUserInfoHttp(@Request() req) {
        return this.getUserInfo(req.user.userId);
    }

    @ApiOperation({ summary: '로그인 횟수 조회' })
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: '로그인 횟수 조회 성공',
        schema: {
            properties: {
                loginCnt: { type: 'number' }
            }
        }
    })

    @Get('login-cnt')
    async getLoginCntHttp(@Request() req, @Body() data: { startDate: Date; endDate: Date }) {
        return this.getLoginCntBetweenEventDate({
            userId: req.user.userId,
            startDate: data.startDate,
            endDate: data.endDate
        });
    }

    // 기존 마이크로서비스 메시지 패턴 핸들러
    @MessagePattern({ cmd: 'register' })
    async register(createUserDto: CreateUserDto) {
        this.logger.log(`Register user: ${createUserDto.username}`);
        const user = await this.usersService.create(createUserDto);
        return {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
    }

    @MessagePattern({ cmd: 'login' })
    async login(loginUserDto: LoginUserDto) {
        this.logger.log(`Login attempt: ${loginUserDto.username}`);
        return this.usersService.login(loginUserDto);
    }

    @MessagePattern({ cmd: 'get_user_info' })
    async getUserInfo(userId: string) {
        this.logger.log(`Get UserInfo for user: ${userId}`);
        const user = await this.usersService.findOne(userId);
        return {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        }
    }

    @MessagePattern({ cmd: 'get_user_login_cnt' })
    async getLoginCntBetweenEventDate(@Payload() data: { userId: string; startDate: Date; endDate: Date }) {
        this.logger.log(`Get User LoginCnt for user: ${data.userId}`);
        this.logger.log(`StartDate: ${data.startDate}`);

        const startDate = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
        const endDate = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;

        const loginCnt = await this.usersService.countAttendancesInPeriod(
            data.userId,
            startDate,
            endDate
        );

        return {
            loginCnt: loginCnt,
        };
    }

    @MessagePattern({ cmd: 'admin_only' })
    async adminOnly(data: { userId: string, role: string }) {
        this.logger.log(`Admin only access from: ${data.userId}`);
        if (data.role !== 'ADMIN') {
            return { error: 'Access denied', statusCode: 403 };
        }
        return { message: 'top secret' };
    }
}