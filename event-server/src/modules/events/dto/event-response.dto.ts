// src/modules/events/dto/event-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';
import {ConditionType, EventStatus} from "../schemas/event.schema";


class EventConditionResponseDto {
    @Expose()
    type: ConditionType;

    @Expose()
    value: number;

    @Expose()
    description: string;
}

export class EventResponseDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    startDate: Date;

    @Expose()
    endDate: Date;

    @Expose()
    status: EventStatus;

    @Expose()
    @Type(() => EventConditionResponseDto)
    conditions: EventConditionResponseDto[];

    @Expose()
    createdBy: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Exclude()
    __v: number;
}