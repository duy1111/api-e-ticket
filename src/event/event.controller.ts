import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Event } from '@prisma/client';
import { APISummaries } from 'src/helpers/helpers';
import { CreateEventDto } from './dto/create-event.dto';
import { EventService } from './event.service';
import { PageDto } from 'src/prisma/helper/prisma.helper';
import { EventModel } from './model/event.model';

@ApiTags('event')
@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: Event })
  @UseGuards(UseGuards)
  @Post('create')
  async createLocation(@Body() data: CreateEventDto): Promise<Event> {
    return await this.eventService.createEvent(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: [EventModel] })
  @ApiBearerAuth()
  @UseGuards(UseGuards)
  @Get()
  findAllEvents(
    @Query(new ValidationPipe({ transform: true })) query: PageDto,
  ): Promise<EventModel[]> {
    return this.eventService.getAllEvents(query);
  }
}
