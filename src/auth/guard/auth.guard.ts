import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

export class UserGuard extends AuthGuard('user') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
}

export class AdminGuard extends AuthGuard('admin') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
}
