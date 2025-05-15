// src/modules/events/events.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
    constructor(
        @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    ) {}

    async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
        if (new Date(createEventDto.startDate) >= new Date(createEventDto.endDate)) {
            throw new BadRequestException('시작일은 종료일보다 빨라야 합니다');
        }

        const createdEvent = new this.eventModel({
            ...createEventDto,
            createdBy: userId,
        });

        return createdEvent.save();
    }

    async findAll(status?: EventStatus): Promise<Event[]> {
        const query = status ? { status } : {};
        return this.eventModel.find(query).exec();
    }

    async findOne(id: string): Promise<Event> {
        const event = await this.eventModel.findById(id).exec();

        if (!event) {
            throw new NotFoundException(`ID가 ${id}인 이벤트를 찾을 수 없습니다`);
        }

        return event;
    }

    async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
        const updatedEvent = await this.eventModel.findByIdAndUpdate(
            id,
            updateEventDto,
            { new: true },
        ).exec();

        if (!updatedEvent) {
            throw new NotFoundException(`ID가 ${id}인 이벤트를 찾을 수 없습니다`);
        }

        return updatedEvent;
    }

    async remove(id: string): Promise<void> {
        const result = await this.eventModel.deleteOne({ _id: id }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(`ID가 ${id}인 이벤트를 찾을 수 없습니다`);
        }
    }

    // 이벤트 조건 검증 로직
    async verifyEventConditions(userId: string, eventId: string): Promise<boolean> {
        const event = await this.findOne(eventId);

        // 이벤트가 활성 상태인지 확인
        if (event.status !== EventStatus.ACTIVE) {
            return false;
        }

        // 이벤트 기간이 유효한지 확인
        const now = new Date();
        if (now < new Date(event.startDate) || now > new Date(event.endDate)) {
            return false;
        }

        // 이벤트 조건 검증 로직 (예시)
        // 실제로는 외부 서비스나 DB 쿼리를 통해 사용자의 조건 충족 여부를 확인
        for (const condition of event.conditions) {
            const isConditionMet = await this.checkCondition(userId, condition);
            if (!isConditionMet) {
                return false;
            }
        }

        return true;
    }

    private async checkCondition(userId: string, condition: any): Promise<boolean> {
        // 조건 유형에 따른 검증 로직
        switch (condition.type) {
            case 'LOGIN_STREAK':
                return this.checkLoginStreak(userId, condition.value);
            case 'FRIEND_INVITE':
                return this.checkFriendInvites(userId, condition.value);
            case 'CUSTOM':
                return this.checkCustomCondition(userId, condition);
            default:
                return false;
        }
    }

    // 이 메서드들은 실제 구현에서는 사용자 활동을 추적하는 데이터베이스를 조회해야 함
    private async checkLoginStreak(userId: string, requiredDays: number): Promise<boolean> {
        // 실제 구현: 사용자의 로그인 기록 확인
        return true; // 예시로 항상 참 반환
    }

    private async checkFriendInvites(userId: string, requiredInvites: number): Promise<boolean> {
        // 실제 구현: 사용자가 초대한 친구 수 확인
        return true; // 예시로 항상 참 반환
    }

    private async checkCustomCondition(userId: string, condition: any): Promise<boolean> {
        // 실제 구현: 커스텀 조건 확인 로직
        return true; // 예시로 항상 참 반환
    }
}