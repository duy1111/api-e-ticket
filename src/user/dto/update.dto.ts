import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateDto {
  @IsString()
  @IsEmail()
  @IsOptional()
  @ApiProperty({ type: String })
  email?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  phoneNumber?: string;
}
