import { ApiProperty } from '@nestjs/swagger';
import { EventStatusEnum } from '@prisma/client';
import { Expose } from 'class-transformer';
import { ETicketBookModel } from 'src/e-ticket-book/model/e-ticket-book.model';
import { LocationModel } from 'src/location/model/location.model';

export class EventModel {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  name: string;

  @Expose()
  @ApiProperty({ type: String })
  description: string;

  @Expose()
  @ApiProperty({ type: Date })
  end_time: Date;

  @Expose()
  @ApiProperty({ type: Number })
  creatorId: number;

  @Expose()
  @ApiProperty({ type: String })
  status: EventStatusEnum;

  @Expose()
  @ApiProperty({ type: Number })
  locationId: number;

  @Expose()
  @ApiProperty({ type: () => LocationModel })
  location: LocationModel;

  @Expose()
  @ApiProperty({ type: () => LocationModel })
  ETicketBook: ETicketBookModel;
}
