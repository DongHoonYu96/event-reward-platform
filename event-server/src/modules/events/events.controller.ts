import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from './schemas/event.schema';

@Controller()
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @MessagePattern({ cmd: 'create_event' })
    create(@Payload() data: { createEventDto: CreateEventDto; userId: string }) {
        return this.eventsService.create(data.createEventDto, data.userId);
    }

    @MessagePattern({ cmd: 'find_all_events' })
    findAll(@Payload() data: { status?: EventStatus }) {
        return this.eventsService.findAll(data.status);
    }

    @MessagePattern({ cmd: 'find_one_event' })
    findOne(@Payload() id: string) {
        return this.eventsService.findOne(id);
    }

    @MessagePattern({ cmd: 'update_event' })
    update(@Payload() data: { id: string; updateEventDto: UpdateEventDto }) {
        return this.eventsService.update(data.id, data.updateEventDto);
    }

    @MessagePattern({ cmd: 'remove_event' })
    remove(@Payload() id: string) {
        return this.eventsService.remove(id);
    }
}