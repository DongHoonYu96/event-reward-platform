import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        example: '타락파워전사',
        description: '사용자 아이디',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        example: 'password123',
        description: '비밀번호',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({
        example: 'bingsu@nexon.com',
        description: '이메일 주소',
        required: true
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    //todo : 일반회원만 가입 가능하도록 수정, 관리자계정은 내부에서 생성
    @ApiProperty({
        example: 'USER',
        description: '사용자 역할',
        enum: UserRole,
        default: UserRole.USER,
        required: false
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.USER;
}