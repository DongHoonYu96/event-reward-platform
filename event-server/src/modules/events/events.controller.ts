import {Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, Query} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from './schemas/event.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('이벤트')
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    // HTTP 엔드포인트 추가
    @ApiOperation({ summary: '이벤트 생성' })
    @ApiBearerAuth('JWT-auth')
    @ApiResponse({
        status: 201,
        description: '이벤트 생성 성공',
        type: CreateEventDto
    })
    @Post()
    async createHttp(@Body() createEventDto: CreateEventDto, @Request() req) {
        return this.create({ createEventDto, userId: req.user.userId });
    }

    @ApiOperation({ summary: '이벤트 목록 조회' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: EventStatus,
        description: '이벤트 상태로 필터링 (선택사항)'
    })
    @ApiResponse({
        status: 200,
        description: '이벤트 목록 조회 성공',
        type: [CreateEventDto]
    })
    @Get()
    async findAllHttp(@Query('status') status: EventStatus) {
        return this.findAll({ status });
    }

    @ApiOperation({ summary: '이벤트 상세 조회' })
    @ApiParam({ name: 'id', description: '이벤트 ID' })
    @ApiResponse({
        status: 200,
        description: '이벤트 상세 조회 성공',
        type: CreateEventDto
    })
    @Get(':id')
    async findOneHttp(@Param('id') id: string) {
        return this.findOne(id);
    }

    @ApiOperation({ summary: '이벤트 수정' })
    @ApiBearerAuth('JWT-auth')
    @ApiParam({ name: 'id', description: '이벤트 ID' })
    @ApiResponse({
        status: 200,
        description: '이벤트 수정 성공',
        type: UpdateEventDto
    })
    @Put(':id')
    async updateHttp(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        return this.update({ id, updateEventDto });
    }

    @ApiOperation({ summary: '이벤트 삭제' })
    @ApiBearerAuth('JWT-auth')
    @ApiParam({ name: 'id', description: '이벤트 ID' })
    @ApiResponse({
        status: 200,
        description: '이벤트 삭제 성공'
    })
    @Delete(':id')
    async removeHttp(@Param('id') id: string) {
        return this.remove(id);
    }

    // 기존 마이크로서비스 메시지 패턴 핸들러
    @MessagePattern({ cmd: 'create_event' })
    create(@Payload() data: { createEventDto: CreateEventDto; userId: string }) {
        return this.eventsService.create(data.createEventDto, data.userId);
    }

    @MessagePattern({ cmd: 'find_all_events' })
    findAll(@Payload() data: { status?: EventStatus }) {
        return this.eventsService.findAll(data.status);
    }

    @MessagePattern({ cmd: 'find_one_event' })
    findOne(@Payload() id: string) {
        return this.eventsService.findOne(id);
    }

    @MessagePattern({ cmd: 'update_event' })
    update(@Payload() data: { id: string; updateEventDto: UpdateEventDto }) {
        return this.eventsService.update(data.id, data.updateEventDto);
    }

    @MessagePattern({ cmd: 'remove_event' })
    remove(@Payload() id: string) {
        return this.eventsService.remove(id);
    }
}