import { IsNotEmpty, IsString } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class LoginUserDto {
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
    password: string;
}