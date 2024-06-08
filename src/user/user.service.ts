import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { genRandomString } from 'src/helpers/helpers';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModel } from './model/user.model';
import { plainToInstance } from 'class-transformer';
import { UserType } from 'src/helpers/types';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findById(id: number): Promise<UserModel> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        hashedPassword: false,
      },
    });

    return plainToInstance(UserModel, user);
  }

  async verifyUser(user: { email: string; username: string }): Promise<string> {
    const verifyToken = genRandomString(10);

    const existedUser = await this.prisma.user.findFirst({
      where: {
        username: user.username,
      },
      select: {
        name: true,
      },
    });

    await this.prisma.user.update({
      data: {
        verifyToken: verifyToken,
      },
      where: {
        username: user.username,
      },
    });

    this.mailService.sendEmailConfirmation(
      { email: user.email, name: existedUser.name },
      verifyToken,
    );

    return 'Verification email sended';
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  async updateProfile(user: UserType, dto: any): Promise<UserModel> {
    const updatedUser = await this.prisma.user.update({
      data: {
        ...dto,
      },
      where: {
        id: user.id,
      },
      select: {
        hashedPassword: false,
      },
    });

    return plainToInstance(UserModel, updatedUser);
  }
}
