import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCheckoutDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  eventId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  quantity: number;
}
