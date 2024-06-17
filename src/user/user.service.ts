import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { genRandomString } from 'src/helpers/helpers';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModel } from './model/user.model';
import { plainToInstance } from 'class-transformer';
import { UserType } from 'src/helpers/types';
import { UpdateDto } from './dto/update.dto';
import { Role } from 'src/auth/enum/role.enum';

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
    });
    delete user.hashedPassword;

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
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    delete user.hashedPassword;
    return user;
  }

  async updateProfile(user: UserType, dto: UpdateDto): Promise<UserModel> {
    const updatedUser = await this.prisma.user.update({
      data: {
        ...dto,
      },
      where: {
        id: user.id,
      },
    });

    delete updatedUser.hashedPassword;

    return plainToInstance(UserModel, updatedUser);
  }

  async getAllUsers(): Promise<UserModel[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isDeleted: true,
        isVerified: true,
        createdAt: true,
        phoneNumber: true,
        updatedAt: true,
      },
    });

    return users.map((user) => plainToInstance(UserModel, user));
  }

  async deleteUser(id: number): Promise<UserModel> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        isDeleted: true,
      },
    });

    delete updatedUser.hashedPassword;

    return plainToInstance(UserModel, updatedUser);
  }

  async restoreUser(id: number): Promise<UserModel> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: null,
        isDeleted: false,
      },
    });

    delete updatedUser.hashedPassword;

    return plainToInstance(UserModel, updatedUser);
  }

  async updateRoleStaff(id: number): Promise<UserModel> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        role: Role.STAFF,
      },
    });

    delete updatedUser.hashedPassword;

    return plainToInstance(UserModel, updatedUser);
  }
}
