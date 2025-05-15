import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { Claim, ClaimSchema } from './schemas/claim.schema';
import { EventsModule } from '../events/events.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
        EventsModule,
        RewardsModule,
    ],
    controllers: [ClaimsController],
    providers: [ClaimsService],
})
export class ClaimsModule {}