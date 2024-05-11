import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PageDto, PaginationHandle } from 'src/prisma/helper/prisma.helper';
import { plainToInstance } from 'class-transformer';
import { EventModel } from './model/event.model';
import { ETicketBookService } from 'src/e-ticket-book/e-ticket-book.service';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private eTicketBookService: ETicketBookService,
  ) {}

  async createEvent(data: CreateEventDto): Promise<Event> {
    const event = await this.prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        creatorId: data.creatorId,
        locationId: data.locationId,
      },
    });

    // If an ETicketBook is provided, create it

    if (data.eTicketBook) {
      await this.eTicketBookService.createETicketBook(
        data.eTicketBook,
        event.id,
        new Date(),
        data.start_time,
      );

      return event;
    }
  }

  async getAllEvents(query: PageDto): Promise<EventModel[]> {
    const dbQuery = {
      include: {
        location: true,
      },
    };

    PaginationHandle(dbQuery, query.page, query.pageSize);

    const events = await this.prisma.event.findMany(dbQuery);

    return plainToInstance(EventModel, events);
  }
}
