import { Cipher, EncryptionService } from '@hedger/nestjs-encryption';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateETicketDto } from './dto/e-ticket.dto';
import { ETicketStatusEnum, User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ETicketModel } from './model/e-ticket.model';
import { genRandomString } from 'src/helpers/helpers';
import { RegisterDto } from 'src/auth/dto/auth.dto';
import { SendETicketDto } from './dto/send-e-ticket.dto';
import { UserType } from 'src/helpers/types';
import * as argon from 'argon2';

// const key = EncryptionService.generateKey(Cipher.AES_256_CBC);
const key = EncryptionService.generateKey(Cipher.AES_256_CBC);
console.log(key);
@Injectable()
export class ETicketService {
  constructor(
    private prisma: PrismaService,
    private readonly crypto: EncryptionService,
  ) {}

  async createETicket(
    dto: CreateETicketDto,
    userId: number,
  ): Promise<ETicketModel> {
    const encrypted = this.crypto.encrypt(JSON.stringify(dto));
    console.log({
      ...dto,
      QrCode: encrypted,
      status: ETicketStatusEnum.PURCHASE,
    });
    const eTicket = await this.prisma.eTicket.create({
      data: {
        ...dto,
        userId: userId,
        QrCode: encrypted,
        status: ETicketStatusEnum.PURCHASE,
      },
    });

    return plainToInstance(ETicketModel, eTicket);
  }

  async scanETicket(qrCode: string, eTicketId: number, eventId: number) {
    const eTicket = await this.prisma.eTicket.findUnique({
      where: {
        id: eTicketId,
      },
    });

    if (!eTicket) {
      throw new Error('e-ticket not found');
    }

    const decrypted = this.crypto.decrypt(qrCode);

    const e_ticket_decipher = JSON.parse(decrypted);

    if (e_ticket_decipher?.serialNo !== eTicket?.serialNo) {
      throw new Error('e-ticket not match serial');
    }
    if (eTicket?.status !== ETicketStatusEnum.PURCHASE) {
      throw new Error('e-ticket had used');
    }

    eTicket.status = ETicketStatusEnum.REDEEM;

    eTicket.redeemTime = new Date();

    await this.prisma.eTicket.update({
      where: {
        id: eTicketId,
      },
      data: {
        status: ETicketStatusEnum.REDEEM,
        redeemTime: new Date(),
      },
    });

    return plainToInstance(ETicketModel, eTicket);
  }

  async getETicketById(id: number) {
    const eTicket = await this.prisma.eTicket.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        event: true,
      },
    });
    return plainToInstance(ETicketModel, eTicket);
  }

  async getAllETicketsByUserId(userId: number) {
    const eTickets = await this.prisma.eTicket.findMany({
      where: {
        userId: userId,
      },
      include: {
        event: {
          include: {
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plainToInstance(ETicketModel, eTickets);
  }

  async getAllETickets() {
    const eTickets = await this.prisma.eTicket.findMany({
      include: {
        event: {
          include: {
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plainToInstance(ETicketModel, eTickets);
  }

  async sendETicket(params: SendETicketDto, owner: UserType) {
    const eTicketId = params.eTicketId;

    const userPlaceholder: RegisterDto = {
      email: params.email,
      password: '123456a@',
      username: genRandomString(12),
      name: 'John Doe',
    };
    let InvitationUser: User;
    const checkEmailExist = await this.prisma.user.findUnique({
      where: {
        email: params.email,
      },
    });

    if (!checkEmailExist) {
      InvitationUser = await this.prisma.user.create({
        data: {
          email: userPlaceholder.email,
          username: userPlaceholder.username,
          hashedPassword: await argon.hash(userPlaceholder.password),
          name: userPlaceholder.name,
        },
      });
      if (!InvitationUser) {
        throw new BadRequestException('Failed create new user!');
      }
    } else {
      InvitationUser = checkEmailExist;
    }

    const eTicket = await this.prisma.eTicket.findUnique({
      where: {
        id: +eTicketId,
      },
    });

    if (eTicket.userId !== owner.id) {
      throw new BadRequestException('User invalid!');
    }

    eTicket.userId = InvitationUser.id;
    eTicket.QrCode = this.crypto.encrypt(JSON.stringify(eTicket));

    await this.prisma.eTicket.update({
      where: {
        id: +eTicketId,
      },
      data: {
        userId: InvitationUser.id,
        QrCode: eTicket.QrCode,
      },
    });

    return 'Send e-ticket success!';
  }
}
