import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import filesystem from './storage/filesystem';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { EventModule } from './event/event.module';
import { LocationModule } from './location/location.module';
import { ETicketBookService } from './e-ticket-book/e-ticket-book.service';
import { ETicketBookModule } from './e-ticket-book/e-ticket-book.module';
import { ETicketModule } from './e-ticket/e-ticket.module';
import AppConfig from './config/config';
import {
  EncryptionModule,
  Cipher,
  EncryptionService,
} from '@hedger/nestjs-encryption';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [filesystem, AppConfig],
    }),
    EncryptionModule.forRoot({
      key: process.env.APP_KEY,
      cipher: Cipher.AES_256_CBC,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    MailModule,
    EventModule,
    LocationModule,
    ETicketBookModule,
    ETicketModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService, ETicketBookService],
})
export class AppModule {}
