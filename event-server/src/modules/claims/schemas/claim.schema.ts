import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, Schema as MongooseSchema, Types} from 'mongoose';

export enum ClaimStatus {
    REQUESTED = 'REQUESTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: true })
export class Claim extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
    eventId: MongooseSchema.Types.ObjectId;

    @Prop({
        type: String,
        enum: Object.values(ClaimStatus),
        default: ClaimStatus.REQUESTED
    })
    status: ClaimStatus;

    @Prop()
    rejectionReason: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    processedBy: Types.ObjectId;

    @Prop()
    processedAt: Date;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Reward' }] })
    rewards: MongooseSchema.Types.ObjectId[];
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);