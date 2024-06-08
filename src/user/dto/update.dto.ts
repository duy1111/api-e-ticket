import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ type: String })
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  phoneNumber?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ type: Boolean })
  isDeleted?: boolean;
}
