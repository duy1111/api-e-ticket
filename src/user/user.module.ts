import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserController } from './user.controller';
import { MailService } from 'src/mail/mail.service';

@Module({
  providers: [UserService, PrismaService, MailService],
  controllers: [UserController],
})
export class UserModule {}
