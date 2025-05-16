import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {EventStatus} from "../../../common/consts/enums";
import {Roles, UserRole} from "../../../common/decorators/roles.decorator";
import {IsPublic} from "../../../common/decorators/is-public.decorator";

@Controller('EVENT-SERVICE/events')
export class EventsProxyController {
    constructor(
        @Inject('EVENT_SERVICE')
        private readonly eventProxy: ClientProxy,
    ) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    create(@Body() createEventDto: any, @Request() req) {
        return this.eventProxy.send(
            { cmd: 'create_event' },
            { createEventDto, userId: req.user?.userId }
        );
    }

    @Get()
    @IsPublic()
    findAll(@Query('status') status: EventStatus) {
        return this.eventProxy.send(
            { cmd: 'find_all_events' },
            { status }
        );
    }

    @Get(':id')
    @IsPublic()
    findOne(@Param('id') id: string) {
        return this.eventProxy.send(
            { cmd: 'find_one_event' },
            id
        );
    }

    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    update(@Param('id') id: string, @Body() updateEventDto: any) {
        return this.eventProxy.send(
            { cmd: 'update_event' },
            { id, updateEventDto }
        );
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    remove(@Param('id') id: string) {
        return this.eventProxy.send(
            { cmd: 'remove_event' },
            id
        );
    }
}
