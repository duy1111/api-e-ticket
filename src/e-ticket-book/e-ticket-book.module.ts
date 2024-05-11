import { Module } from '@nestjs/common';
import { ETicketBookController } from './e-ticket-book.controller';
import { ETicketBookService } from './e-ticket-book.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ETicketBookController],
  providers: [ETicketBookService, PrismaService],
})
export class ETicketBookModule {}
