import {Body, Controller, Get, Inject, Param, Post, Put, Query, Request} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {Roles, UserRole} from "../../../common/decorators/roles.decorator";
import {PaginationParams} from "../../../common/interfaces/pagination.interface";

@Controller('EVENT-SERVICE/claims')
export class ClaimsProxyController {
    constructor(
        @Inject('EVENT_SERVICE')
        private readonly eventProxy: ClientProxy,
    ) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.USER)
    create(@Body() createClaimDto: any, @Request() req) {
        return this.eventProxy.send(
            { cmd: 'create_claim' },
            { createClaimDto, userId: req.user?.userId }
        );
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.AUDITOR)
    findAll(
        @Query('status') status: string,
        @Query('eventId') eventId: string,
        @Query('userId') userId: string,
        @Query() paginationDto: PaginationParams
    ) {
        return this.eventProxy.send(
            { cmd: 'find_all_claims' },
            { status, eventId, userId, paginationDto }
        );
    }

    @Get('my')
    findMyClaims(@Request() req) {
        return this.eventProxy.send(
            { cmd: 'find_my_claims' },
            req.user?.userId
        );
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.AUDITOR)
    findOne(@Param('id') id: string, @Request() req) {
        return this.eventProxy.send(
            { cmd: 'find_one_claim' },
            { id, user: req.user }
        );
    }

    @Put(':id/make-decision')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
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