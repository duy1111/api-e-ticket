import { Cipher, EncryptionService } from '@hedger/nestjs-encryption';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateETicketDto } from './dto/e-ticket.dto';
import { ETicketStatusEnum } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ETicketModel } from './model/e-ticket.model';
import e from 'express';
// const key = EncryptionService.generateKey(Cipher.AES_256_CBC);
const key = EncryptionService.generateKey(Cipher.AES_256_CBC);
console.log(key);
@Injectable()
export class ETicketService {
  constructor(
    private prisma: PrismaService,
    private readonly crypto: EncryptionService,
  ) {}

  async createETicket(dto: CreateETicketDto): Promise<ETicketModel> {
    const encrypted = this.crypto.encrypt(JSON.stringify(dto));
    console.log({
      ...dto,
      QrCode: encrypted,
      status: ETicketStatusEnum.PURCHASE,
    });
    const eTicket = await this.prisma.eTicket.create({
      data: {
        ...dto,
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

    return plainToInstance(ETicketModel, eTicket);
  }

  async getETicketById(id: number) {
    const eTicket = await this.prisma.eTicket.findUnique({
      where: {
        id,
      },
      select: {
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
    });

    return plainToInstance(ETicketModel, eTickets);
  }
}
