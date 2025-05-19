import {IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { ClaimStatus } from '../schemas/claim.schema';
import {ApiProperty} from "@nestjs/swagger";

export class ProcessClaimDto {
    @ApiProperty({
        enum: ClaimStatus,
        description: '처리 상태',
        example: ClaimStatus.REJECTED,
        required: true
    })
    @IsEnum(ClaimStatus)
    @IsNotEmpty()
    status: ClaimStatus;

    @ApiProperty({
        description: '처리 메모',
        example: '이벤트 기간 동안 출석 일수 부족',
        required: false
    })
    @IsString()
    @IsOptional()
    rejectionReason: string;
}