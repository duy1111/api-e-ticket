import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ETicket,
  ETicketBookStatus,
  Event,
  EventStatusEnum,
  User,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PageDto, PaginationHandle } from 'src/prisma/helper/prisma.helper';
import { plainToInstance } from 'class-transformer';
import { EventModel } from './model/event.model';
import { ETicketBookService } from 'src/e-ticket-book/e-ticket-book.service';
import { create } from 'domain';
import { UpdateEventDto } from './dto/update-event.dto';
import e from 'express';
import { SendETicketDto } from 'src/e-ticket/dto/send-e-ticket.dto';
import { UserType } from 'src/helpers/types';
import { AuthService } from 'src/auth/auth.service';
import * as argon from 'argon2';
import { RegisterDto } from 'src/auth/dto/auth.dto';
import { randomUUID } from 'crypto';
import { genRandomString } from 'src/helpers/helpers';
import { UserService } from 'src/user/user.service';
import { EncryptionService } from '@hedger/nestjs-encryption';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private eTicketBookService: ETicketBookService,
    private readonly crypto: EncryptionService,
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
    const eventsActive = await this.prisma.event.findMany({
      where: {
        status: EventStatusEnum.PUBLISHED,
        AND: [
          {
            start_time: {
              lte: new Date(),
            },
          },
          {
            end_time: {
              gte: new Date(),
            },
          },
        ],
      },
      include: {
        location: true,
        ETicketBook: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const eventsUpcoming = await this.prisma.event.findMany({
      where: {
        status: EventStatusEnum.PUBLISHED,
        start_time: {
          gt: new Date(), // Greater than current time
        },
      },
      include: {
        location: true,
        ETicketBook: true,
      },
      orderBy: {
        start_time: 'asc', // Sắp xếp theo thời gian bắt đầu từ gần đến xa
      },
    });

    // Nối danh sách sự kiện đang diễn ra và sắp diễn ra, đảm bảo sự kiện đang diễn ra xuất hiện trước
    const combinedEvents = [...eventsActive, ...eventsUpcoming];

    return plainToInstance(EventModel, combinedEvents);
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
