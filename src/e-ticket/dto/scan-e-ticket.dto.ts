import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class scanETicketDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  qrCode?: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  eTicketId?: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  eventId?: number;
}
