import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateClaimDto {
    @IsMongoId()
    @IsNotEmpty()
    eventId: string;
}