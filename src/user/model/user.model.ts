import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role } from 'src/auth/enum/role.enum';

export class UserModel {
  @Expose()
  @ApiProperty({ type: Number })
  id: number;

  @Expose()
  @ApiProperty({ type: String })
  email: string;

  @Expose()
  @ApiProperty({ type: String })
  username: string;

  @Expose()
  @ApiProperty({ type: String })
  firstName: string;

  @Expose()
  @ApiProperty({ type: String })
  lastName: string;

  @Expose()
  @ApiProperty({ type: String })
  verifyToken: string;

  @Expose()
  @ApiProperty({ type: Boolean })
  isDeleted: boolean;

  @Expose()
  @ApiProperty({ type: Date })
  verifyAt: Date;

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: Date })
  updatedAt: Date;

  @Expose()
  @ApiProperty({ type: String })
  role: Role;

  @Expose()
  @ApiProperty({ type: String })
  phoneNumber: string;
}
