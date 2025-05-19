import { IsString, IsNotEmpty, IsDate, IsEnum, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, ConditionType } from '../schemas/event.schema';
import { ApiProperty } from '@nestjs/swagger';

export class EventConditionDto {
    @ApiProperty({
        enum: ConditionType,
        description: '이벤트 조건 타입',
        example: ConditionType.CONTINUOUS_LOGIN,
        required: true
    })
    @IsEnum(ConditionType)
    @IsNotEmpty()
    type: ConditionType;

    @ApiProperty({
        description: '이벤트 조건 값',
        example: 5,
        required: true
    })
    @IsNumber()
    @IsNotEmpty()
    value: number;

    @ApiProperty({
        description: '이벤트 조건 설명',
        example: '이벤트 기간동안 5회 이상 로그인 시 보상 지급',
        required: false
    })
    @IsString()
    @IsOptional()
    description: string;
}

export class CreateEventDto {
    @ApiProperty({
        description: '이벤트 제목',
        example: '여름 시즌 이벤트',
        required: true
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: '이벤트 설명',
        example: '여름 시즌 특별 이벤트입니다.',
        required: false
    })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({
        description: '이벤트 시작일',
        example: '2024-05-01T00:00:00Z',
        required: true
    })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    startDate: Date;

    @ApiProperty({
        description: '이벤트 종료일',
        example: '2024-06-31T23:59:59Z',
        required: true
    })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    endDate: Date;

    @ApiProperty({
        enum: EventStatus,
        description: '이벤트 상태',
        example: EventStatus.ACTIVE,
        required: false,
        default: EventStatus.ACTIVE
    })
    @IsEnum(EventStatus)
    @IsOptional()
    status: EventStatus;

    @ApiProperty({
        type: [EventConditionDto],
        description: '이벤트 조건 목록',
        example: [
            {
                type: ConditionType.CONTINUOUS_LOGIN,
                value: 5,
                description: '5회 이상 로그인 시 보상 지급'
            }
        ],
        required: false
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EventConditionDto)
    @IsOptional()
    conditions: EventConditionDto[];
}