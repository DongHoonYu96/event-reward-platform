// src/modules/rewards/dto/create-reward.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsMongoId } from 'class-validator';
import { RewardType } from '../schemas/reward.schema';

export class CreateRewardDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(RewardType)
    @IsNotEmpty()
    type: RewardType;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsOptional()
    itemId: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsMongoId()
    @IsNotEmpty()
    eventId: string;
}