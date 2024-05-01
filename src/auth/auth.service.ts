import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { User } from '@prisma/client';
import * as argon from 'argon2';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { pick } from 'lodash';
import { genRandomString } from 'src/helpers/helpers';
import { ErrorMessages } from 'src/helpers/helpers';
import { UserModel } from 'src/user/model/user.model';
import { AuthModel } from './model/auth.model';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}
  private readonly jwtSecret = this.config.get('auth.jwtSecret');

  async register(dto: RegisterDto): Promise<AuthModel> {
    const hashedPassword = await argon.hash(dto.password);
    const checkEmailExist = await this.checkEmailExist(dto.email);
    if (checkEmailExist) {
      throw new BadRequestException('Email is Exist');
    }
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hashedPassword: hashedPassword,
        name: dto.name,
      },
    });

    return await this.signToken(user);
  }

  async checkEmailExist(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user)
      throw new ForbiddenException(ErrorMessages.AUTH.CREDENTIALS_INCORRECT);
    if (user.isDeleted)
      throw new ForbiddenException(ErrorMessages.AUTH.CREDENTIALS_INCORRECT);

    const passwordMatches = await argon.verify(
      user.hashedPassword,
      dto.password,
    );

    if (!passwordMatches)
      throw new ForbiddenException(ErrorMessages.AUTH.CREDENTIALS_INCORRECT);

    return this.signToken(user);
  }

  async signToken(user: User): Promise<AuthModel> {
    const pickedFields: string[] = ['id', 'email', 'name', 'role', 'username'];
    const payload = pick(user, pickedFields);

    const accessToken: string = await this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: process.env.JWT_SECRET,
    });

    const refreshToken: string = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });

    return {
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  async refreshToken(user: Partial<User>) {
    const pickedFields: string[] = ['id', 'email', 'name', 'role', 'username'];
    const payload = pick(user, pickedFields);

    const accessToken: string = await this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: process.env.JWT_SECRET,
    });

    const refreshToken: string = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  async verifyUser(user: { email: string; username: string }): Promise<string> {
    const verifyToken = genRandomString(10);

    const existedUser = await this.prisma.user.findFirst({
      where: {
        username: user.username,
      },
      select: {
        name: true,
      },
    });

    await this.prisma.user.update({
      data: {
        verifyToken: verifyToken,
      },
      where: {
        username: user.username,
      },
    });

    this.mailService.sendEmailConfirmation(
      { email: user.email, name: existedUser.name },
      verifyToken,
    );

    return 'Verification email sended';
  }

  async resetPasswordRequest(dto: RequestResetPasswordDto): Promise<void> {
    const resetToken = genRandomString(10);

    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (!user) return;

    await this.prisma.user.update({
      data: {
        resetToken: resetToken,
      },
      where: {
        email: dto.email,
      },
    });

    await this.mailService.sendResetPasswordEmail(
      {
        email: user.email,
        name: user.name,
      },
      resetToken,
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (!dto.token)
      throw new BadRequestException(ErrorMessages.AUTH.INVALID_TOKEN);

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
      },
    });

    if (!user) throw new BadRequestException(ErrorMessages.AUTH.INVALID_TOKEN);

    const hashedPassword = await argon.hash(dto.password);

    await this.prisma.user.update({
      data: {
        hashedPassword: hashedPassword,
        resetToken: null,
      },
      where: {
        email: user.email,
      },
    });
  }
}
