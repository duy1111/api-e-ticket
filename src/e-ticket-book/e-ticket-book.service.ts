import { Injectable } from '@nestjs/common';
import { ETicketBook } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateETicketBookDto } from './dto/create-eTicketBook.dto';
import { UpdateETicketBookDto } from './dto/update-eTicketBook.dto';

@Injectable()
export class ETicketBookService {
  constructor(private prisma: PrismaService) {}

  async createETicketBook(
    data: CreateETicketBookDto,
    eventId: number,
    startTime: Date,
    closeTime: Date,
  ): Promise<ETicketBook> {
    const existingETicketBook = await this.getETicketBookByEventId(eventId);

    // If an ETicketBook with the given eventId already exists, throw an error
    if (existingETicketBook) {
      throw new Error('An ETicketBook with this eventId already exists');
    }

    // If no ETicketBook with the given eventId exists, create a new one
    return await this.prisma.eTicketBook.create({
      data: {
        total: data.total,
        price: data.price,
        currency: data.currency,
        startTime: startTime,
        closeTime: closeTime,
        eventId: eventId,
      },
    });
  }

  async updateETicketBook(
    data: UpdateETicketBookDto,
    eventId: number,
  ): Promise<void> {
    await this.prisma.eTicketBook.update({
      where: {
        eventId,
      },
      data: {
        total: data.total,
        price: data.price,
        currency: data.currency,
      },
    });
  }

  async getETicketBookByEventId(eventId: number): Promise<ETicketBook> {
    return await this.prisma.eTicketBook.findUnique({
      where: {
        eventId,
      },
    });
  }
}
