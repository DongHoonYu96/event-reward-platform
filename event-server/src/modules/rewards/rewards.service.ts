// src/modules/rewards/rewards.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward } from './schemas/reward.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Injectable()
export class RewardsService {
    constructor(
        @InjectModel(Reward.name) private rewardModel: Model<Reward>,
    ) {}

    async create(createRewardDto: CreateRewardDto): Promise<Reward> {
        const createdReward = new this.rewardModel(createRewardDto);
        return createdReward.save();
    }

    async findByEvent(eventId: string): Promise<Reward[]> {
        return this.rewardModel.find({ eventId }).exec();
    }

    async findOne(id: string): Promise<Reward> {
        const reward = await this.rewardModel.findById(id).exec();

        if (!reward) {
            throw new NotFoundException(`ID가 ${id}인 보상을 찾을 수 없습니다`);
        }

        return reward;
    }

    async update(id: string, updateRewardDto: UpdateRewardDto): Promise<Reward> {
        const updatedReward = await this.rewardModel.findByIdAndUpdate(
            id,
            updateRewardDto,
            { new: true },
        ).exec();

        if (!updatedReward) {
            throw new NotFoundException(`ID가 ${id}인 보상을 찾을 수 없습니다`);
        }

        return updatedReward;
    }

    async remove(id: string): Promise<void> {
        const result = await this.rewardModel.deleteOne({ _id: id }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(`ID가 ${id}인 보상을 찾을 수 없습니다`);
        }
    }
}