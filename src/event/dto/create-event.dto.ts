import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateETicketBookDto } from 'src/e-ticket-book/dto/create-eTicketBook.dto';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, nullable: false })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, nullable: false })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: Date, required: true, nullable: false })
  start_time: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: Date, required: true, nullable: false })
  end_time: Date;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  creatorId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ type: Number, required: true, nullable: false })
  locationId: number;

  @IsOptional()
  @ApiProperty({ type: CreateETicketBookDto, required: false, nullable: true })
  eTicketBook: CreateETicketBookDto;
}
