import { Controller, Get, Post, Body, Param, Request, Query, Put } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ProcessClaimDto } from './dto/process-claim.dto';
import { ClaimStatus } from './schemas/claim.schema';

@Controller('claims')
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) {}

    @Post()
    create(@Body() createClaimDto: CreateClaimDto, @Request() req) {
        return this.claimsService.create(createClaimDto, req.user?.userId);
    }

    @Get()
    findAll(
        @Query('status') status: ClaimStatus,
        @Query('eventId') eventId: string,
        @Query('userId') userId: string,
    ) {
        return this.claimsService.findAll(status, eventId, userId);
    }

    @Get('my')
    findMyClams(@Request() req) {
        return this.claimsService.findByUser(req.user?.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.claimsService.findOne(id, req.user);
    }

    @Put(':id/make-decision')
    makeDecisionOnClaim(
        @Param('id') id: string,
        @Body() processClaimDto: ProcessClaimDto,
        @Request() req,
    ) {
        return this.claimsService.makeDecisionOnClaim(id, processClaimDto, req.user?.userId);
    }
}