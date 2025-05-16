import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum EventStatus {
    DRAFT = 'DRAFT', // 초안, 아직 공개되지 않음
    ACTIVE = 'ACTIVE', // 진행 중
    INACTIVE = 'INACTIVE', // 임시 중단(버그 등)
    COMPLETED = 'COMPLETED', // 정상종료
}

export enum ConditionType {
    CONTINUOUS_LOGIN = 'CONTINUOUS_LOGIN',
    FRIEND_INVITE = 'FRIEND_INVITE',
    CUSTOM = 'CUSTOM',
}

@Schema()
export class EventCondition {
    @Prop({ required: true, enum: Object.values(ConditionType) })
    type: ConditionType;

    @Prop({ required: true })
    value: number;

    @Prop()
    description: string;
}

@Schema({ timestamps: true })
export class Event extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({
        type: String,
        enum: Object.values(EventStatus),
        default: EventStatus.DRAFT
    })
    status: EventStatus;

    @Prop({ type: [{ type: MongooseSchema.Types.Mixed }] })
    conditions: EventCondition[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    createdBy: MongooseSchema.Types.ObjectId;
}

export const EventSchema = SchemaFactory.createForClass(Event);