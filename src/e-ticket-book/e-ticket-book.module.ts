import { Module } from '@nestjs/common';
import { ETicketBookController } from './e-ticket-book.controller';
import { ETicketBookService } from './e-ticket-book.service';

@Module({
  controllers: [ETicketBookController],
  providers: [ETicketBookService]
})
export class ETicketBookModule {}
