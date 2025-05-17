import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ProcessClaimDto } from './dto/process-claim.dto';
import { ClaimStatus } from './schemas/claim.schema';

@Controller()
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) {}

    @MessagePattern({ cmd: 'create_claim' })
   async create(@Payload() data: { createClaimDto: CreateClaimDto; userId: string }) {
        const claim = await this.claimsService.create(data.createClaimDto, data.userId);
        return {
            id: claim._id,
            userId: claim.userId,
            eventId: claim.eventId,
            status: claim.status,
            rewards: claim.rewards,
        }
    }

    @MessagePattern({ cmd: 'find_all_claims' })
    findAll(@Payload() data: { status?: ClaimStatus; eventId?: string; userId?: string }) {
        return this.claimsService.findAll(data.status, data.eventId, data.userId);
    }

    @MessagePattern({ cmd: 'find_my_claims' })
    findMyClams(@Payload() userId: string) {
        return this.claimsService.findByUser(userId);
    }

    @MessagePattern({ cmd: 'find_one_claim' })
    findOne(@Payload() data: { id: string; user: any }) {
        return this.claimsService.findOne(data.id, data.user);
    }

    @MessagePattern({ cmd: 'make_decision_on_claim' })
    makeDecisionOnClaim(
        @Payload() data: { id: string; processClaimDto: ProcessClaimDto; userId: string }
    ) {
        return this.claimsService.makeDecisionOnClaim(
            data.id,
            data.processClaimDto,
            data.userId
        );
    }
}