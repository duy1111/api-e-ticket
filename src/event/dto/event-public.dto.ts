import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class EventPublicDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  id: number;
}
