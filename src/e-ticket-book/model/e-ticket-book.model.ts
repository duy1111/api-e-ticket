import { ApiProperty } from '@nestjs/swagger';
import { CurrencyEnum, ETicketBookStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class ETicketBookModel {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: Number })
  total: number;

  @Expose()
  @ApiProperty({ type: Number })
  sold: number;

  @Expose()
  @ApiProperty({ type: Number })
  price: number;

  @Expose()
  @ApiProperty({ type: String })
  currency: CurrencyEnum;

  @Expose()
  @ApiProperty({ type: String })
  status: ETicketBookStatus;

  @Expose()
  @ApiProperty({ type: Date })
  startTime: Date;

  @Expose()
  @ApiProperty({ type: Date })
  closeTime: Date;
}
