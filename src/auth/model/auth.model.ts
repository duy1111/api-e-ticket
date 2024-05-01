import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Expose } from 'class-transformer';
import { UserModel } from 'src/user/model/user.model';

export class AuthModel {
  @Expose()
  @ApiProperty({ type: String })
  accessToken: string;

  @Expose()
  @ApiProperty({ type: String })
  refreshToken: string;

  @Expose()
  @ApiProperty({ type: UserModel })
  user: User;

  @Expose()
  @ApiProperty({ type: Number })
  expiresIn: number;
}
