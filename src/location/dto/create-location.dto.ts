import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, nullable: false })
  address: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  latitudeFloat: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  longitudeFloat: number;
}
