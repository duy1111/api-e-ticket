import { Injectable } from '@nestjs/common';
import { ETicketBookStatus, Event, EventStatusEnum } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PageDto, PaginationHandle } from 'src/prisma/helper/prisma.helper';
import { plainToInstance } from 'class-transformer';
import { EventModel } from './model/event.model';
import { ETicketBookService } from 'src/e-ticket-book/e-ticket-book.service';
import { create } from 'domain';
import { UpdateEventDto } from './dto/update-event.dto';
import e from 'express';

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

  async updateEvent(data: UpdateEventDto, id: number): Promise<string> {
    const event = await this.prisma.event.update({
      where: {
        id: id,
      },
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

    const eTicketBook = await this.eTicketBookService.updateETicketBook(
      data.eTicketBook,
      event.id,
    );

    return 'Update success!';
  }

  async getAllEvents(): Promise<EventModel[]> {
    const events = await this.prisma.event.findMany({
      // where: {
      //   status: {
      //     not: EventStatusEnum.DEACTIVE,
      //   },
      // },
      include: {
        location: true,
        ETicketBook: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plainToInstance(EventModel, events);
  }

  async getListEventIntro(): Promise<EventModel[]> {
    const events = await this.prisma.event.findMany({
      where: {
        status: EventStatusEnum.PUBLISHED,
      },
      include: {
        location: true,
        ETicketBook: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

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
    const event = await this.prisma.event.update({
      where: {
        id: id,
      },
      data: {
        status: EventStatusEnum.DEACTIVE,
      },
    });

    return plainToInstance(EventModel, event);
  }
}
