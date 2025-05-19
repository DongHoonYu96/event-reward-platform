// src/modules/events/events.service.ts
import {Injectable, NotFoundException, BadRequestException, Logger} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {KeySetPaginationDto} from "../../common/dto/keyset-pagination.dto";
import {KeySetPaginationResultDto} from "../../common/dto/keyset-pagination-result.dto";

@Injectable()
export class EventsService {
    private readonly logger = new Logger(EventsService.name);
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

    async findAll(
        status?: EventStatus,
        paginationDto?: KeySetPaginationDto
    ): Promise<KeySetPaginationResultDto<Event>> {
        const { lastId, limit = 10 } = paginationDto || {};

        this.logger.debug(`이벤트 목록 조회: status=${status}, lastId=${lastId}, limit=${limit}`);
        this.logger.debug('타입 체크: ' + typeof limit);

        const query: any = {};
        if (status) {
            query.status = status;
        }
        if (lastId) {
            query._id = { $lt: new Types.ObjectId(lastId) };
        }

        const items = await this.eventModel.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'rewards',
                    localField: '_id',
                    foreignField: 'eventId',
                    as: 'rewards'
                }
            },
            { $sort: { _id: -1 } },
            { $limit: limit + 1 }  // 다음 페이지 존재 여부 확인을 위해 +1
        ]).exec();

        const hasMore = items.length > limit;
        if (hasMore) {
            items.pop();  // 마지막 항목 제거
        }

        return {
            items,
            nextCursor: items.length > 0 ? items[items.length - 1]._id.toString() : undefined,
            hasMore
        };
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