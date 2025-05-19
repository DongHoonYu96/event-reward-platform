import { ApiProperty } from '@nestjs/swagger';
import {IsString, IsNotEmpty, IsNumber, IsOptional, IsMongoId, IsEnum} from 'class-validator';
import {RewardType} from "../schemas/reward.schema";

export class CreateRewardDto {
    @ApiProperty({
        description: '보상 이름',
        example: '가입 축하 포인트',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: '보상 설명',
        example: '신규 가입자를 위한 환영 포인트 보상',
        required: false
    })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({
        description: '보상 타입',
        example: 'POINT',
        required: true
    })
    @IsEnum(RewardType)
    @IsNotEmpty()
    type: RewardType;

    @ApiProperty({
        description: '보상 수량',
        example: 1000,
        required: true
    })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({
        description: '연관된 이벤트 ID',
        example: '68286d357d6737fac10f5879',
        required: true
    })
    @IsMongoId()
    @IsString()
    @IsNotEmpty()
    eventId: string;
}