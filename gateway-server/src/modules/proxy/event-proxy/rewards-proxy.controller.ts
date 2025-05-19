import {Body, Controller, Delete, Get, Inject, Param, Post, Put, Query} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {Roles, UserRole} from "../../../common/decorators/roles.decorator";
import {IsPublic} from "../../../common/decorators/is-public.decorator";
import {PaginationParams} from "../../../common/interfaces/pagination.interface";

@Controller('EVENT-SERVICE/rewards')
export class RewardsProxyController {
    constructor(
        @Inject('EVENT_SERVICE')
        private readonly eventProxy: ClientProxy,
    ) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    create(@Body() createRewardDto: any) {
        return this.eventProxy.send(
            { cmd: 'create_reward' },
            createRewardDto
        );
    }

    @Get('event/:eventId')
    @IsPublic()
    findAllByEvent(@Param('eventId') eventId: string) {
        return this.eventProxy.send(
            { cmd: 'find_rewards_by_event' },
            eventId
        );
    }

    @Get(':id')
    @IsPublic()
    findOne(@Param('id') id: string) {
        return this.eventProxy.send(
            { cmd: 'find_one_reward' },
            id
        );
    }

    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    update(@Param('id') id: string, @Body() updateRewardDto: any) {
        return this.eventProxy.send(
            { cmd: 'update_reward' },
            { id, updateRewardDto }
        );
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    remove(@Param('id') id: string) {
        return this.eventProxy.send(
            { cmd: 'remove_reward' },
            id
        );
    }
} 