import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { APISummaries } from 'src/helpers/helpers';
import { AuthModel } from './model/auth.model';
import {
  LoginDto,
  RegisterDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
  VerifyUserDto,
} from './dto/auth.dto';
import { RefreshJwtGuard } from './guard/refetch.guard';
import { UserGuard } from './guard/auth.guard';
import { GetUser } from './decorator/get-user.decorator';
import { UserType } from 'src/helpers/types';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: APISummaries.UNAUTH })
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({ type: AuthModel })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: APISummaries.UNAUTH })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthModel })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return await this.authService.refreshToken(req.user);
  }

  @ApiOperation({ summary: APISummaries.UNAUTH })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @Post('request-reset-password')
  resetPasswordRequest(@Body() dto: RequestResetPasswordDto) {
    this.authService.resetPasswordRequest(dto);

    return 'Reset password request sent, please check your email for next steps';
  }

  @ApiOperation({ summary: APISummaries.UNAUTH })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    this.authService.resetPassword(dto);

    return 'Password reset successfully';
  }

  @ApiOperation({ summary: APISummaries.USER })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @Get('verify')
  verify(@Query() query: VerifyUserDto) {
    return this.authService.verify(query);
  }
}
