import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly jwtService: JwtService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { username, email, password, role } = createUserDto;

        // 중복 사용자 확인
        const existingUser = await this.userModel.findOne({
            $or: [{ username }, { email }],
        }).exec();

        if (existingUser) {
            throw new ConflictException('사용자 이름 또는 이메일이 이미 사용 중입니다.');
        }

        // 비밀번호 해싱
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        // 사용자 생성
        const newUser = new this.userModel({
            username,
            email,
            password: hashedPassword,
            role: role || UserRole.USER,
        });

        return newUser.save();
    }

    async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
        const { username, password } = loginUserDto;

        // 사용자 찾기
        const user: User = await this.userModel.findOne({ username }).exec();
        if (!user) {
            throw new UnauthorizedException('없는 회원입니다. 회원가입을 진행해 주세요.');
        }

        // 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
        }
        
        await this.recordLoginAttempt(user._id);

        // JWT 토큰 생성
        const payload = {
            sub: user._id,
            username: user.username,
            role: user.role,
        };

        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }
        return user;
    }

    async findByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username }).exec();
        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }
        return user;
    }

    private formatDate(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    private async recordLoginAttempt(userId) {
        const today = new Date();
        // YYYY-MM-DD 형식으로 날짜 변환
        const dateStr = this.formatDate(today);

        // 출석 정보 업데이트
        return this.userModel.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    attendanceDates: dateStr,
                },
                lastActivityAt: today,
            },
            { new: true }
        );
    }
}