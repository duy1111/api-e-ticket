import { Module } from '@nestjs/common';
import { ETicketController } from './e-ticket.controller';
import { ETicketService } from './e-ticket.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [ETicketController],
  providers: [ETicketService, PrismaService],
})
export class ETicketModule {}
