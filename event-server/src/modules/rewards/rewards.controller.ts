import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('보상')
@Controller('rewards')
export class RewardsController {
    constructor(private readonly rewardsService: RewardsService) {}

    // HTTP 엔드포인트 추가
    @ApiOperation({ summary: '보상 생성' })
    @ApiBearerAuth('JWT-auth')
    @ApiResponse({
        status: 201,
        description: '보상 생성 성공',
        type: CreateRewardDto
    })
    @Post()
    async createHttp(@Body() createRewardDto: CreateRewardDto) {
        return this.create(createRewardDto);
    }

    @ApiOperation({ summary: '이벤트별 보상 목록 조회' })
    @ApiParam({ name: 'eventId', description: '이벤트 ID' })
    @ApiResponse({
        status: 200,
        description: '보상 목록 조회 성공',
        type: [CreateRewardDto]
    })
    @Get('event/:eventId')
    async findByEventHttp(@Param('eventId') eventId: string) {
        return this.findByEvent(eventId);
    }

    @ApiOperation({ summary: '보상 상세 조회' })
    @ApiParam({ name: 'id', description: '보상 ID' })
    @ApiResponse({
        status: 200,
        description: '보상 상세 조회 성공',
        type: CreateRewardDto
    })
    @Get(':id')
    async findOneHttp(@Param('id') id: string) {
        return this.findOne(id);
    }

    @ApiOperation({ summary: '보상 수정' })
    @ApiBearerAuth('JWT-auth')
    @ApiParam({ name: 'id', description: '보상 ID' })
    @ApiResponse({
        status: 200,
        description: '보상 수정 성공',
        type: UpdateRewardDto
    })
    @Put(':id')
    async updateHttp(@Param('id') id: string, @Body() updateRewardDto: UpdateRewardDto) {
        return this.update({ id, updateRewardDto });
    }

    @ApiOperation({ summary: '보상 삭제' })
    @ApiBearerAuth('JWT-auth')
    @ApiParam({ name: 'id', description: '보상 ID' })
    @ApiResponse({
        status: 200,
        description: '보상 삭제 성공'
    })
    @Delete(':id')
    async removeHttp(@Param('id') id: string) {
        return this.remove(id);
    }

    // 기존 마이크로서비스 메시지 패턴 핸들러
    @MessagePattern({ cmd: 'create_reward' })
    create(@Payload() createRewardDto: CreateRewardDto) {
        return this.rewardsService.create(createRewardDto);
    }

    @MessagePattern({ cmd: 'find_rewards_by_event' })
    findByEvent(@Payload() eventId: string) {
        return this.rewardsService.findByEvent(eventId);
    }

    @MessagePattern({ cmd: 'find_one_reward' })
    findOne(@Payload() id: string) {
        return this.rewardsService.findOne(id);
    }

    @MessagePattern({ cmd: 'update_reward' })
    update(@Payload() data: { id: string; updateRewardDto: UpdateRewardDto }) {
        return this.rewardsService.update(data.id, data.updateRewardDto);
    }

    @MessagePattern({ cmd: 'remove_reward' })
    remove(@Payload() id: string) {
        return this.rewardsService.remove(id);
    }
}