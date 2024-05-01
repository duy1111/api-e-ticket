import { Module } from '@nestjs/common';
import { ETicketController } from './e-ticket.controller';
import { ETicketService } from './e-ticket.service';

@Module({
  controllers: [ETicketController],
  providers: [ETicketService]
})
export class ETicketModule {}
