import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { AdminStrategy, UserStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AuthService,
    PrismaService,
    JwtService,
    MailService,
    UserStrategy,
    AdminStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
