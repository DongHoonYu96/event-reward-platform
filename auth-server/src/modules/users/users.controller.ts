import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import {IsPublic} from "../../common/decorators/is-public.decorator";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    @IsPublic()
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
    }

    @Post('login')
    @IsPublic()
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.usersService.login(loginUserDto);
    }

    @Get('profile')
    // @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req) {
        return this.usersService.findOne(req.user.userId);
    }

    @Get('admin-only')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    adminOnly() {
        return { message: 'top secret' };
    }
}