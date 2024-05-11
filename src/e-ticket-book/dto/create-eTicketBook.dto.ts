import { ApiProperty } from '@nestjs/swagger';
import { CurrencyEnum, ETicketBookStatus } from '@prisma/client';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateETicketBookDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  total: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  price: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: true, nullable: false })
  currency: CurrencyEnum;
}
