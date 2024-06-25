import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  logger = new Logger(NotificationService.name);
  constructor(private prismaService: PrismaService) {}

  async getAllNotificationTokenByUser(userId: number) {
    const tokens = await this.prismaService.notificationToken.findMany({
      where: {
        userId: userId,
      },
      select: {
        token: true,
      },
    });

    return tokens.map((tokenObject) => tokenObject.token);
  }

  async insertNotificationToken(params: {
    userId: number;
    token: string;
    provider: string;
  }) {
    const { userId, token, provider = 'fcm' } = params;

    if (!token) return null;

    const existingNotificationTokenData =
      await this.prismaService.notificationToken.findFirst({
        where: {
          userId: userId,
          token: token,
          provider: provider,
        },
      });

    if (existingNotificationTokenData) return existingNotificationTokenData.id;

    const createNotificationToken =
      await this.prismaService.notificationToken.create({
        data: {
          userId: userId,
          token: token,
          provider: provider,
        },
      });

    return createNotificationToken.id;
  }

  async updateNotificationToken(params: { userId: number; token: string }) {
    const { userId, token } = params;
    const notificationToken =
      await this.prismaService.notificationToken.findFirst({
        where: {
          userId: userId,
        },
      });

    if (notificationToken) {
      await this.prismaService.notificationToken.update({
        where: {
          id: notificationToken.id,
        },
        data: {
          token: token,
        },
      });
    } else {
      await this.insertNotificationToken({
        userId: userId,
        token: token,
        provider: 'fcm',
      });
    }
  }

  public async pushNotificationToUser(
    options: {
      userId: number;
      title: string;
      message: string;
      custom_payload?: any;
    },
    silent?: boolean,
  ): Promise<void> {
    const tokens = await this.getAllNotificationTokenByUser(options.userId);
    return await this.sendNotificationToTokens({
      tokens,
      title: options.title,
      message: options.message,
    });
  }

  public async sendNotificationToTokens(options: {
    tokens: string[];
    title: string;
    message: string;
  }) {
    if (!options.message) options.message = 'message';

    // const jobName = `sendNotification-${Date.now()}`;
    // //+ 12 * 60 * 60 * 1000
    // const job = new CronJob(new Date(Date.now()), async () => {
    //     const fcmPromises = options.tokens.map(async (token) => {
    //         this.logger.log(`Token: ${JSON.stringify(token)}`);

    //         let pushStatus = false;

    //         pushStatus = await this.pushNotification(token, options.title, options.message);
    //     });

    //     await Promise.all(fcmPromises);

    //     this.schedulerRegistry.deleteCronJob(jobName);
    // });

    // this.schedulerRegistry.addCronJob(jobName, job);
    // job.start();

    const fcmPromises = options.tokens.map(async (token) => {
      this.logger.log(`Token: ${JSON.stringify(token)}`);

      let pushStatus = await this.pushNotification(
        token,
        options.title,
        options.message,
      );
    });

    await Promise.all(fcmPromises);
  }

  private getNotificationPayload(
    instanceIdToken?: string,
    title?: string,
    message?: string,
    custom_payload?: any,
    silent?: boolean,
  ): string {
    const payload = {
      //   icon: this.configService.get('firebase.fcm.icon'),
      to: instanceIdToken,
    };

    if (!silent) {
      payload['notification'] = {
        title: message,
        message,
      };
    }

    if (custom_payload) payload['data'] = custom_payload;

    return JSON.stringify(payload);
  }

  private async pushNotification(
    instanceIdToken?: string,
    title?: string,
    message?: string,
    custom_payload?: any,
    silent?: boolean,
  ): Promise<boolean> {
    const payload = this.getNotificationPayload(
      instanceIdToken,
      title,
      message,
      custom_payload,
      silent,
    );

    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `key=${process.env.FCM_SERVER_KEY}`,
      };

      const { data, status } = await axios.post(
        process.env.FIREBASE_FCM_URL!,
        payload,
        {
          headers: headers,
        },
      );

      const result = JSON.parse(JSON.stringify(data));

      if (status === 200) {
        if (result['success'] == 1) {
          this.logger.log(
            `[FCM] Pushed FCM to ${instanceIdToken} successfully with message_id: ${result['results'][0]['message_id']}`,
          );
          return true;
        } else {
          this.logger.log(
            `[FCM] Pushed FCM to ${instanceIdToken} failed - error: ${result['results'][0]['error']}`,
          );
        }
      } else {
        this.logger.log(
          `[FCM] Pushed FCM failed - status code: ${status} - content: ${JSON.stringify(
            data,
          )}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[FCM] Pushed FCM to ${instanceIdToken} failed - error: ${error}`,
      );
    }

    return false;
  }
}
