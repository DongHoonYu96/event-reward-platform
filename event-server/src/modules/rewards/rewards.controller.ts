// src/modules/rewards/rewards.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Controller()
export class RewardsController {
    constructor(private readonly rewardsService: RewardsService) {}

    @MessagePattern({ cmd: 'create_reward' })
    create(@Payload() createRewardDto: CreateRewardDto) {
        return this.rewardsService.create(createRewardDto);
    }

    @MessagePattern({ cmd: 'find_rewards_by_event' })
    findByEvent(@Payload() eventId: string) {
        return this.rewardsService.findByEvent(eventId);
    }

    @MessagePattern({ cmd: 'find_one_reward' })
    findOne(@Payload() id: string) {
        return this.rewardsService.findOne(id);
    }

    @MessagePattern({ cmd: 'update_reward' })
    update(@Payload() data: { id: string; updateRewardDto: UpdateRewardDto }) {
        return this.rewardsService.update(data.id, data.updateRewardDto);
    }

    @MessagePattern({ cmd: 'remove_reward' })
    remove(@Payload() id: string) {
        return this.rewardsService.remove(id);
    }
}