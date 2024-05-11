import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ETicketBookService } from 'src/e-ticket-book/e-ticket-book.service';

@Module({
  controllers: [EventController],
  providers: [EventService, PrismaService, ETicketBookService],
})
export class EventModule {}
