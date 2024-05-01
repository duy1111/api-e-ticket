import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '../enum/role.enum';
import { CustomExtractJwt } from './jwt-cookie-extractor';

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(private prisma: PrismaService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Take jwt from cookie
        CustomExtractJwt.fromCookie(),
        // Take jwt from http header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { email: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
        isDeleted: false,
      },
    });

    if (!user) return null;

    delete user.hashedPassword;
    if (user.role === Role.USER || user.role === Role.ADMIN) return user;
  }
}

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(configService: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Take jwt from cookie
        CustomExtractJwt.fromCookie(),
        // Take jwt from http header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get('auth.jwtSecret'),
    });
  }

  async validate(payload: { email: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
        isDeleted: false,
      },
    });

    if (!user) return null;
    console.log('user', user);
    delete user.hashedPassword;
    if (user.role === Role.ADMIN) return user;
  }
}
