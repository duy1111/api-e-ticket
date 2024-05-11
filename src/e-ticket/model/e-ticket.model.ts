import { ApiProperty } from '@nestjs/swagger';
import { CurrencyEnum } from '@prisma/client';
import { Expose } from 'class-transformer';
import { EventModel } from 'src/event/model/event.model';
import { UserModel } from 'src/user/model/user.model';

export class ETicketModel {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: Number })
  price: number;

  @Expose()
  @ApiProperty({ type: String })
  serialNo: string;

  @Expose()
  @ApiProperty({ type: String })
  currency: CurrencyEnum;

  @Expose()
  @ApiProperty({ type: Number })
  userId: number;

  @Expose()
  @ApiProperty({ type: Number })
  eventId: number;

  @Expose()
  @ApiProperty({ type: Number })
  eTicketBookId: number;

  @Expose()
  @ApiProperty({ type: () => EventModel })
  event: EventModel;

  @Expose()
  @ApiProperty({ type: () => UserModel })
  user: UserModel;

  @Expose()
  @ApiProperty({ type: Date })
  redeemTime: Date;
}
