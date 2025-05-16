import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
    USER = 'USER',
    OPERATOR = 'OPERATOR',
    AUDITOR = 'AUDITOR',
    ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.USER })
    role: UserRole;

    // 출석 기록 - 날짜 문자열 배열 ('YYYY-MM-DD' 형식)
    @Prop({ type: [String], default: [] })
    attendanceDates: string[];

    @Prop({ default: Date.now })
    lastActivityAt: Date;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);