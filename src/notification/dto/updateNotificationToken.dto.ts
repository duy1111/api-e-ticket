import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class updateNotificationToken {
  @ApiProperty()
  @IsNotEmpty()
  token!: string;

  @ApiProperty()
  @IsNotEmpty()
  userId!: number;
}
