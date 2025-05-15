import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Request,
    Query,
    Put,
    Inject
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RolesGuard } from "../../../common/guards/roles.guard";
import { IsPublic } from "../../../common/decorators/is-public.decorator";
import { Roles, UserRole } from "../../../common/decorators/roles.decorator";

@Controller('EVENT-SERVICE/claims')
export class ClaimsProxyController {
    constructor(
        @Inject('EVENT_SERVICE')
        private readonly eventProxy: ClientProxy,
    ) {}

    @Post()
    create(@Body() createClaimDto: any, @Request() req) {
        return this.eventProxy.send(
            { cmd: 'create_claim' },
            { createClaimDto, userId: req.user?.userId }
        );
    }

    @Get()
    findAll(
        @Query('status') status: string,
        @Query('eventId') eventId: string,
        @Query('userId') userId: string,
    ) {
        return this.eventProxy.send(
            { cmd: 'find_all_claims' },
            { status, eventId, userId }
        );
    }

    @Get('my')
    findMyClams(@Request() req) {
        return this.eventProxy.send(
            { cmd: 'find_my_claims' },
            req.user?.userId
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.eventProxy.send(
            { cmd: 'find_one_claim' },
            { id, user: req.user }
        );
    }

    @Put(':id/make-decision')
    @Roles(UserRole.ADMIN)
    makeDecisionOnClaim(
        @Param('id') id: string,
        @Body() processClaimDto: any,
        @Request() req,
    ) {
        return this.eventProxy.send(
            { cmd: 'make_decision_on_claim' },
            { id, processClaimDto, userId: req.user?.userId }
        );
    }
}