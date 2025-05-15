// src/modules/rewards/schemas/reward.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum RewardType {
    POINT = 'POINT',
    ITEM = 'ITEM',
    COUPON = 'COUPON',
}

@Schema({ timestamps: true })
export class Reward extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({
        type: String,
        enum: Object.values(RewardType),
        required: true
    })
    type: RewardType;

    @Prop({ required: true })
    amount: number;

    @Prop()
    itemId: string;

    @Prop()
    description: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
    eventId: MongooseSchema.Types.ObjectId;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);