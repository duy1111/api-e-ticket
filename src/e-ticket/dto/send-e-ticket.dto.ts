import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class SendETicketDto {
  @ApiProperty()
  @IsNotEmpty()
  eTicketId!: string;

  @ApiProperty()
  @IsNotEmpty()
  email!: string;
}
