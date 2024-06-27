import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Event } from '@prisma/client';
import { AdminGuard, UserGuard } from 'src/auth/guard/auth.guard';
import { APISummaries } from 'src/helpers/helpers';
import { CreateEventDto } from './dto/create-event.dto';
import { EventPublicDto } from './dto/event-public.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';
import { EventModel } from './model/event.model';

@ApiTags('event')
@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: Event })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post('/create')
  async createLocation(@Body() data: CreateEventDto): Promise<Event> {
    return await this.eventService.createEvent(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: Event })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Put('/update/:id')
  async updateLocation(
    @Body() data: UpdateEventDto,
    @Param('id') id: number,
  ): Promise<string> {
    return await this.eventService.updateEvent(data, id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: [EventModel] })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get()
  findAllEvents(): // @Query(new ValidationPipe({ transform: true })) query: PageDto,
  Promise<EventModel[]> {
    return this.eventService.getAllEvents();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: [EventModel] })
  // @ApiBearerAuth()
  // @UseGuards(UserGuard)
  @Get('/intro')
  listEventIntro(): Promise<EventModel[]> {
    return this.eventService.getListEventIntro();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: EventModel })
  @Get('/:id')
  getEvent(@Param('id') id: number): Promise<EventModel> {
    return this.eventService.getEvent(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: EventModel })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('/public')
  publicEvent(@Body() dto: EventPublicDto): Promise<EventModel> {
    return this.eventService.publicEvent(dto.id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: EventModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Delete('/delete/:id')
  deleteEvent(@Param('id') id: number): Promise<EventModel> {
    return this.eventService.deleteEvent(id);
  }
}
