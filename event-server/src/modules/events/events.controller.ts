// src/modules/events/events.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Put, Request, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from './schemas/event.schema';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Post()
    create(@Body() createEventDto: CreateEventDto, @Request() req) {
        return this.eventsService.create(createEventDto, req.user.userId); //
    }

    @Get()
    findAll(@Query('status') status: EventStatus) {
        return this.eventsService.findAll(status);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
        return this.eventsService.update(id, updateEventDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}