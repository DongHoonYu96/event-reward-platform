import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {EventStatus} from "../../../common/consts/enums";

@Controller('EVENT-SERVICE/events')
export class EventsProxyController {
    constructor(
        @Inject('EVENT_SERVICE')
        private readonly eventProxy: ClientProxy,
    ) {}

    @Post()
    create(@Body() createEventDto: any, @Request() req) {
        return this.eventProxy.send(
            { cmd: 'create_event' },
            { createEventDto, userId: req.user?.userId }
        );
    }

    @Get()
    findAll(@Query('status') status: EventStatus) {
        return this.eventProxy.send(
            { cmd: 'find_all_events' },
            { status }
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventProxy.send(
            { cmd: 'find_one_event' },
            id
        );
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateEventDto: any) {
        return this.eventProxy.send(
            { cmd: 'update_event' },
            { id, updateEventDto }
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventProxy.send(
            { cmd: 'remove_event' },
            id
        );
    }
}
