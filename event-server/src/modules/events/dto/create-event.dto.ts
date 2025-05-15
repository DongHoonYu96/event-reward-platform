// src/modules/events/dto/create-event.dto.ts
import { IsString, IsNotEmpty, IsDate, IsEnum, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, ConditionType } from '../schemas/event.schema';

export class EventConditionDto {
    @IsEnum(ConditionType)
    @IsNotEmpty()
    type: ConditionType;

    @IsNumber()
    @IsNotEmpty()
    value: number;

    @IsString()
    @IsOptional()
    description: string;
}

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    startDate: Date;

    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    endDate: Date;

    @IsEnum(EventStatus)
    @IsOptional()
    status: EventStatus;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EventConditionDto)
    @IsOptional()
    conditions: EventConditionDto[];
}