import { Controller, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import {MessagePattern, Payload} from '@nestjs/microservices';

@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);
    constructor(private readonly usersService: UsersService) {}

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

        // 문자열인 경우 Date 객체로 변환
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