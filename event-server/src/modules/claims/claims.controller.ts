import { Controller, Get, Post, Body, Put, Param, Query, Request } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ProcessClaimDto } from './dto/process-claim.dto';
import { ClaimStatus } from './schemas/claim.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import {KeySetPaginationDto} from "../../common/dto/keyset-pagination.dto";
import {plainToClass} from "class-transformer";

@ApiTags('보상 청구')
@Controller('claims')
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) {}

    // HTTP 엔드포인트 추가
    @ApiOperation({ summary: '보상 청구 생성' })
    @ApiBearerAuth('JWT-auth')
    @ApiResponse({
        status: 201,
        description: '보상 청구 생성 성공',
        schema: {
            properties: {
                id: { type: 'string' },
                userId: { type: 'string' },
                eventId: { type: 'string' },
                status: { type: 'string' },
                rewards: { type: 'array', items: { type: 'object' } }
            }
        }
    })
    @Post()
    async createHttp(@Body() createClaimDto: CreateClaimDto, @Request() req) {
        return this.create({ createClaimDto, userId: req.user.userId });
    }

    @ApiOperation({ summary: '보상 청구 목록 조회' })
    @ApiBearerAuth('JWT-auth')
    @ApiQuery({ name: 'status', required: false, enum: ClaimStatus })
    @ApiQuery({ name: 'eventId', required: false })
    @ApiQuery({ name: 'userId', required: false })
    @ApiResponse({
        status: 200,
        description: '보상 청구 목록 조회 성공',
        type: [CreateClaimDto]
    })
    @Get()
    async findAllHttp(
        @Query('status') status: ClaimStatus,
        @Query('eventId') eventId: string,
        @Query('userId') userId: string,
        @Query() paginationDto: KeySetPaginationDto
    ) {
        return this.findAll({ status, eventId, userId , paginationDto});
    }

    @ApiOperation({ summary: '내 보상 청구 목록 조회' })
    @ApiBearerAuth('JWT-auth')
    @ApiResponse({
        status: 200,
        description: '내 보상 청구 목록 조회 성공',
        type: [CreateClaimDto]
    })
    @Get('my')
    async findMyClaimsHttp(@Request() req) {
        return this.findMyClaims(req.user.userId);
    }

    @ApiOperation({ summary: '보상 청구 상세 조회' })
    @ApiBearerAuth('JWT-auth')
    @ApiParam({ name: 'id', description: '보상 청구 ID' })
    @ApiResponse({
        status: 200,
        description: '보상 청구 상세 조회 성공',
        type: CreateClaimDto
    })
    @Get(':id')
    async findOneHttp(@Param('id') id: string, @Request() req) {
        return this.findOne({ id, user: req.user });
    }

    @ApiOperation({ summary: '보상 청구 처리' })
    @ApiBearerAuth('JWT-auth')
    @ApiParam({ name: 'id', description: '보상 청구 ID' })
    @ApiResponse({
        status: 200,
        description: '보상 청구 처리 성공',
        type: ProcessClaimDto
    })
    @Put(':id/process')
    async makeDecisionOnClaimHttp(
        @Param('id') id: string,
        @Body() processClaimDto: ProcessClaimDto,
        @Request() req
    ) {
        return this.makeDecisionOnClaim({
            id,
            processClaimDto,
            userId: req.user.userId
        });
    }

    // 기존 마이크로서비스 메시지 패턴 핸들러
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
    findAll(@Payload() data: {
        eventId: string;
        paginationDto: KeySetPaginationDto;
        userId: string;
        status: ClaimStatus
    }) {
        const keySetPaginationDto = plainToClass(KeySetPaginationDto, data.paginationDto);
        return this.claimsService.findAll(data.status, data.eventId, data.userId, keySetPaginationDto);
    }

    @MessagePattern({ cmd: 'find_my_claims' })
    findMyClaims(@Payload() userId: string) {
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