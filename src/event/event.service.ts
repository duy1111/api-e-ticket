import { Injectable } from '@nestjs/common';
import { ETicketBookStatus, Event, EventStatusEnum } from '@prisma/client';
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
        imageUrl: data.imageUrl,
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

  // async updateEvent(data: UpdateEventDto): Promise<Event> {
  //   const event = await this.prisma.event.update({
  //     where: {
  //       id: data.id,
  //     },
  //     data: {
  //       name: data.name,
  //       description: data.description,
  //       start_time: data.start_time,
  //       imageUrl: data.imageUrl,
  //       end_time: data.end_time,
  //       creatorId: data.creatorId,
  //       locationId: data.locationId,
  //     },
  //   });

  //   // If an ETicketBook is provided, create it

  //   if (data.eTicketBook) {
  //     await this.eTicketBookService.createETicketBook(
  //       data.eTicketBook,
  //       event.id,
  //       new Date(),
  //       data.start_time,
  //     );

  //     return event;
  //   }
  // }

  async getAllEvents(): Promise<EventModel[]> {
    const dbQuery = {
      include: {
        location: true,
        ETicketBook: true,
      },
    };

    const events = await this.prisma.event.findMany(dbQuery);

    return plainToInstance(EventModel, events);
  }

  async getListEventIntro(): Promise<EventModel[]> {
    const dbQuery = {
      include: {
        location: true,
        ETicketBook: true,
      },
    };

    const events = await this.prisma.event.findMany(dbQuery);

    return plainToInstance(EventModel, events);
  }

  async getEvent(id: number): Promise<EventModel> {
    const event = await this.prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        location: true,
        ETicketBook: true,
      },
    });

    return plainToInstance(EventModel, event);
  }

  async publicEvent(id: number): Promise<EventModel> {
    const event = await this.prisma.event.update({
      where: {
        id,
      },
      data: {
        status: EventStatusEnum.PUBLISHED,
        publishedTime: new Date(),
        ETicketBook: {
          update: {
            status: ETicketBookStatus.OPEN,
          },
        },
      },
    });

    return plainToInstance(EventModel, event);
  }

  async deleteEvent(id: number): Promise<EventModel> {
    const event = await this.prisma.event.delete({
      where: {
        id,
      },
    });

    return plainToInstance(EventModel, event);
  }
}
