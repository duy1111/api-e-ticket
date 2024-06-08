import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EventModel } from 'src/event/model/event.model';
import { UserModel } from 'src/user/model/user.model';

export class PurchaseModel {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  stripeCheckoutSessionId: string;

  @Expose()
  @ApiProperty({ type: String })
  stripeCustomerId: string;

  @Expose()
  @ApiProperty({ type: String })
  stripeSubscriptionId: string;

  @Expose()
  @ApiProperty({ type: String })
  eventId: string;

  @Expose()
  @ApiProperty({ type: String })
  userId: string;

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: () => EventModel })
  event: EventModel;

  @Expose()
  @ApiProperty({ type: () => UserModel })
  user: UserModel;
}
