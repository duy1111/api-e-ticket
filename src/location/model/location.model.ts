import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EventModel } from 'src/event/model/event.model';

enum LocationStatusEnum {
  ACTIVE = 'ACTIVE',
  DEACTIVE = 'DEACTIVE',
}

export class LocationModel {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  address: string;

  @Expose()
  @ApiProperty({ type: Number })
  latitudeFloat: number;

  @Expose()
  @ApiProperty({ type: Number })
  longitudeFloat: number;

  @Expose()
  @ApiProperty({ type: () => [EventModel] })
  event: EventModel[];
}
