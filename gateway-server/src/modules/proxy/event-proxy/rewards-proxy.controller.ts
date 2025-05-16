import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('EVENT-SERVICE/rewards')
export class RewardsProxyController {
    constructor(
        @Inject('EVENT_SERVICE')
        private readonly eventProxy: ClientProxy,
    ) {}

    @Post()
    create(@Body() createRewardDto: any) {
        return this.eventProxy.send(
            { cmd: 'create_reward' },
            createRewardDto
        );
    }

    @Get('event/:eventId')
    findByEvent(@Param('eventId') eventId: string) {
        return this.eventProxy.send(
            { cmd: 'find_rewards_by_event' },
            eventId
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventProxy.send(
            { cmd: 'find_one_reward' },
            id
        );
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateRewardDto: any) {
        return this.eventProxy.send(
            { cmd: 'update_reward' },
            { id, updateRewardDto }
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventProxy.send(
            { cmd: 'remove_reward' },
            id
        );
    }
} 