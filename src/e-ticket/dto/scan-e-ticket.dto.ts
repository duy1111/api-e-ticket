import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class scanETicketDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  qrCode!: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  eTicketId!: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  eventId!: number;
}
