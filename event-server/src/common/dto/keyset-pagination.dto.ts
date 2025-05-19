import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString, Min} from "class-validator";
import {Type} from "class-transformer";

export class KeySetPaginationDto {
    @ApiProperty({
        description: '마지막으로 조회한 항목의 ID',
        required: false
    })
    @IsOptional()
    @IsString()
    lastId?: string;

    @ApiProperty({
        description: '페이지당 항목 수',
        required: false,
        default: 10
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit?: number = 10;
}