import { Controller, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { MessagePattern } from '@nestjs/microservices';

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

    @MessagePattern({ cmd: 'admin_only' })
    async adminOnly(data: { userId: string, role: string }) {
        this.logger.log(`Admin only access from: ${data.userId}`);
        if (data.role !== 'ADMIN') {
            return { error: 'Access denied', statusCode: 403 };
        }
        return { message: 'top secret' };
    }
}