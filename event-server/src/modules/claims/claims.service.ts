import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Claim, ClaimStatus } from './schemas/claim.schema';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ProcessClaimDto } from './dto/process-claim.dto';
import { EventsService } from '../events/events.service';
import { RewardsService } from '../rewards/rewards.service';

@Injectable()
export class ClaimsService {
    constructor(
        @InjectModel(Claim.name) private readonly claimModel: Model<Claim>,
        private readonly eventsService: EventsService,
        private readonly rewardsService: RewardsService,
    ) {}

    async create(createClaimDto: CreateClaimDto, userId: string): Promise<Claim> {
        // 이벤트 존재 여부 확인
        const event = await this.eventsService.findOne(createClaimDto.eventId);

        // 이벤트 조건 충족 여부 검증
        const conditionsMet = await this.eventsService.verifyEventConditions(userId, createClaimDto.eventId);
        if (!conditionsMet) {
            throw new BadRequestException('이벤트 조건을 충족하지 않았습니다');
        }

        // 중복 청구 확인
        const existingClaim = await this.claimModel.findOne({
            userId,
            eventId: createClaimDto.eventId,
            status: { $in: [ClaimStatus.REQUESTED, ClaimStatus.APPROVED, ClaimStatus.COMPLETED] },
        }).exec();

        if (existingClaim) {
            throw new BadRequestException('이미 이 이벤트에 대한 보상을 청구했습니다');
        }

        // 보상 목록 조회
        const rewards = await this.rewardsService.findByEvent(createClaimDto.eventId);
        const rewardIds = rewards.map(reward => reward._id);

        // 청구 생성
        const newClaim = new this.claimModel({
            userId,
            eventId: createClaimDto.eventId,
            status: ClaimStatus.REQUESTED,
            rewards: rewardIds,
        });

        return newClaim.save();
    }

    async findAll(
        status?: ClaimStatus,
        eventId?: string,
        userId?: string,
    ): Promise<Claim[]> {
        const query: any = {};

        if (status) {
            query.status = status;
        }

        if (eventId) {
            query.eventId = eventId;
        }

        if (userId) {
            query.userId = userId;
        }

        return this.claimModel.find(query)
            .populate('eventId')
            .populate('rewards')
            .exec();
    }

    async findByUser(userId: string): Promise<Claim[]> {
        return this.claimModel.find({ userId })
            .populate('eventId')
            .populate('rewards')
            .exec();
    }

    async findOne(id: string, user: any): Promise<Claim> {
        const claim = await this.claimModel.findById(id)
            .populate('eventId')
            .populate('rewards')
            .exec();

        if (!claim) {
            throw new NotFoundException(`ID가 ${id}인 청구를 찾을 수 없습니다`);
        }

        // 본인의 청구 또는 운영자/감사자/관리자만 접근 가능
        if (claim.userId.toString() !== user.userId &&
            !['OPERATOR', 'AUDITOR', 'ADMIN'].includes(user.role)) {
            throw new ForbiddenException('이 청구에 접근할 권한이 없습니다');
        }

        return claim;
    }

    async makeDecisionOnClaim(
        id: string,
        processClaimDto: ProcessClaimDto,
        operatorId: string,
    ): Promise<Claim> {
        const claim = await this.claimModel.findById(id).exec();

        if (!claim) {
            throw new NotFoundException(`ID가 ${id}인 청구를 찾을 수 없습니다`);
        }

        if (claim.status !== ClaimStatus.REQUESTED) {
            throw new BadRequestException('이미 처리된 청구입니다');
        }

        // 상태 업데이트
        claim.status = processClaimDto.status;
        claim.processedBy = new Types.ObjectId(operatorId);
        claim.processedAt = new Date();

        if (processClaimDto.status === ClaimStatus.REJECTED && processClaimDto.rejectionReason) {
            claim.rejectionReason = processClaimDto.rejectionReason;
        }

        // 승인 시 실제 보상 지급 처리를 여기서 구현할 수 있음
        // 예: 외부 서비스 호출 또는 DB 업데이트

        return claim.save();
    }
}