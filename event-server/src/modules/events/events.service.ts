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


    async findAll(status?: EventStatus): Promise<any[]> {
        const matchStage = status ? { status } : {};

        return this.findAllWithRewards(matchStage);
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

    private findAllWithRewards(matchStage: { status: EventStatus } | {}) {
        return this.eventModel.aggregate([
            {$match: matchStage},
            {
                $lookup: {
                    from: 'rewards',
                    localField: '_id',
                    foreignField: 'eventId',
                    as: 'rewards'
                }
            },
            {$sort: {createdAt: -1}}
        ]).exec();
    }
}