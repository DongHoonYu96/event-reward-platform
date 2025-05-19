import {
    BadRequestException,
    ForbiddenException,
    HttpStatus,
    Inject,
    Injectable,
    Logger,
    NotFoundException
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {Claim, ClaimStatus} from './schemas/claim.schema';
import {CreateClaimDto} from './dto/create-claim.dto';
import {ProcessClaimDto} from './dto/process-claim.dto';
import {EventsService} from '../events/events.service';
import {RewardsService} from '../rewards/rewards.service';
import {ClientProxy, RpcException} from "@nestjs/microservices";
import {Event, EventCondition, EventStatus} from "../events/schemas/event.schema";
import {firstValueFrom} from "rxjs";

@Injectable()
export class ClaimsService {
    private readonly logger = new Logger(ClaimsService.name);
    constructor(
        @InjectModel(Claim.name) private readonly claimModel: Model<Claim>,
        private readonly eventsService: EventsService,
        private readonly rewardsService: RewardsService,
        @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy
    ) {}

    async create(createClaimDto: CreateClaimDto, userId: string): Promise<Claim> {

        const event = await this.ValidateIsEventExist(createClaimDto);
        await this.validateIsActiveEvent(event, createClaimDto, userId);

        await this.validateIsDuplicateClaim(userId, createClaimDto);

        await this.validateIsConditionMet(event, userId, createClaimDto);

        // 보상 목록 조회
        const rewards = await this.rewardsService.findByEvent(createClaimDto.eventId);
        const rewardIds = rewards.map(reward => reward._id);

        // 청구 생성
        const newClaim = new this.claimModel({
            userId,
            eventId: createClaimDto.eventId,
            status: ClaimStatus.APPROVED,
            rewards: rewardIds,
        });
        // todo : 보상 지급 처리 로직 추가
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

    private async validateIsConditionMet(event: Event, userId: string, createClaimDto: CreateClaimDto) {
        for (const condition of event.conditions) {
            const isConditionMet = await this.checkCondition(userId, condition, event);
            if (!isConditionMet) {
                await this.recordFailedClaim(
                    createClaimDto.eventId,
                    userId,
                    `조건을 충족하지 못했습니다: ${condition.description}`
                );
                this.logger.warn(`조건을 충족하지 못했습니다: ${condition.description}`);
                throw new RpcException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `조건을 충족하지 못했습니다: ${condition.description}`,
                    error: 'Bad Request',
                })
            }
        }
    }

    private async validateIsDuplicateClaim(userId: string, createClaimDto: CreateClaimDto) {
        const existingClaim = await this.claimModel.findOne({
            userId,
            eventId: createClaimDto.eventId,
            status: {$in: [ClaimStatus.REQUESTED, ClaimStatus.APPROVED]},
        }).exec();
        if (existingClaim) {
            await this.recordFailedClaim(
                createClaimDto.eventId,
                userId,
                '이미 이 이벤트에 대한 보상을 청구했습니다'
            );
            this.logger.warn(`이미 이 이벤트에 대한 보상을 청구했습니다: ${createClaimDto.eventId}`);
            throw new RpcException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: '이미 이 이벤트에 대한 보상을 청구했습니다',
                error: 'Bad Request',
            })
        }
    }

    private async validateIsActiveEvent(event: Event, createClaimDto: CreateClaimDto, userId: string) {
        if (event.status !== EventStatus.ACTIVE) {
            await this.recordFailedClaim(
                createClaimDto.eventId,
                userId,
                '이벤트가 활성 상태가 아닙니다'
            );
            this.logger.warn(`이벤트가 활성 상태가 아닙니다: ${event.status}`);
            throw new RpcException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: '이벤트가 활성 상태가 아닙니다',
                error: 'Bad Request',
            })
        }
    }

    private async ValidateIsEventExist(createClaimDto: CreateClaimDto) {
        const event = await this.eventsService.findOne(createClaimDto.eventId);
        if (!event) {
            this.logger.warn(`이벤트를 찾을 수 없습니다: ${createClaimDto.eventId}`);
            throw new RpcException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: '이벤트를 찾을 수 없습니다',
                error: 'Bad Request',
            })
        }
        return event;
    }



    private async recordFailedClaim(
        eventId: string,
        userId: string,
        reason: string
    ): Promise<Claim> {
        const claim = new this.claimModel({
            eventId,
            userId,
            status: ClaimStatus.REJECTED,
            rejectionReason: reason,
            processedAt: new Date()
        });

        return claim.save();
    }

    private async getUserInfoFromAuthServer(userId: string): Promise<any> {
        try {
            // Auth 서비스에 TCP 요청을 보내 사용자 로그인 정보 가져오기
            return await firstValueFrom(
                this.authClient.send(
                    { cmd: 'get_user_info' },
                    userId
                )
            );
        } catch (error) {
            this.logger.error(`사용자 정보를 가져오는 중 오류 발생: ${error.message}\n auth-server 긴급 점검 필요!!`);
            throw new RpcException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: '사용자 정보를 가져오는 중 오류 발생',
                error: 'Internal Server Error',
            })
        }
    }

    private async checkCondition(userId: string, condition: EventCondition, event: Event): Promise<boolean> {
        // 조건 유형에 따른 검증 로직
        switch (condition.type) {
            case 'CONTINUOUS_LOGIN':
                return this.checkContinuousLogin(userId, condition, event);
            case 'FRIEND_INVITE':
                return this.checkFriendInvites(userId, condition);
            case 'CUSTOM':
                return this.checkCustomCondition(userId, condition);
            default:
                return false;
        }
    }

    // 이 메서드들은 실제 구현에서는 사용자 활동을 추적하는 데이터베이스를 조회해야 함
    private async checkContinuousLogin(userId: string, condition: EventCondition, event : Event): Promise<boolean> {
        // 이벤트의 요구 연속 로그인 일수와 사용자의 연속 로그인 일수 비교
        const requiredDays = condition.value || 0;

        this.logger.log('event.startDate: ' + event.startDate);
        this.logger.log('event.endDate: ' + event.endDate);
        this.logger.log('userId: ' + userId);
        const userConsecutiveDays = await this.getUserConsecutiveDaysFrom(userId, event);

        this.logger.log(`User ${userId} has logged in for ${userConsecutiveDays.loginCnt} consecutive days.`);
        this.logger.log(`Required consecutive days: ${requiredDays}`);

        return userConsecutiveDays.loginCnt >= requiredDays;
    }

    private async getUserConsecutiveDaysFrom(userId: string, event: Event) {
        return await this.authClient.send(
            {cmd: 'get_user_login_cnt'},
            {
                userId: userId,
                startDate: event.startDate,
                endDate: event.endDate
            }
        ).toPromise(
        ) || 0;
    }

    private async checkFriendInvites(userId: string, condition: EventCondition): Promise<boolean> {
        // 실제 구현: 사용자가 초대한 친구 수 확인
        return true; // 예시로 항상 참 반환
    }

    private async checkCustomCondition(userId: string, condition: any): Promise<boolean> {
        // 실제 구현: 커스텀 조건 확인 로직
        return true; // 예시로 항상 참 반환
    }

}