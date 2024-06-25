import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserGuard } from 'src/auth/guard/auth.guard';
import { updateNotificationToken } from './dto/updateNotificationToken.dto';
import { NotificationService } from './notification.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private notificationsService: NotificationService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Patch('/update-notification-fcm')
  @UseGuards(UserGuard)
  async updateNotificationFcm(@Body() body: updateNotificationToken) {
    return this.notificationsService.updateNotificationToken({
      userId: body.userId,
      token: body.token,
    });
  }
}
