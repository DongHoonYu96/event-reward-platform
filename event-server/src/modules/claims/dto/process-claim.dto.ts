import {IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { ClaimStatus } from '../schemas/claim.schema';

export class ProcessClaimDto {
    @IsEnum(ClaimStatus)
    @IsNotEmpty()
    status: ClaimStatus;

    @IsString()
    @IsOptional()
    rejectionReason: string;
}