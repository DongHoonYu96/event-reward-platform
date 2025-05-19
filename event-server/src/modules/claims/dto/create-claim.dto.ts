import {IsMongoId, IsNotEmpty, IsString} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateClaimDto {
    @ApiProperty({
        description: '이벤트 ID',
        example: '68286d357d6737fac10f5879',
        required: true
    })
    @IsMongoId()
    @IsString()
    @IsNotEmpty()
    eventId: string;
}