import { ApiProperty } from '@nestjs/swagger';
import { CurrencyEnum } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString, isNumber } from 'class-validator';

export class CreateETicketDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  price: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, nullable: false })
  serialNo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, nullable: false })
  currency: CurrencyEnum;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  eventId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  eTicketBookId: number;
}
