import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { APISummaries } from 'src/helpers/helpers';
import { AdminGuard } from 'src/auth/guard/auth.guard';
import { UserModel } from './model/user.model';
import { User } from '@prisma/client';
import { VerifyDto } from './dto/verify.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: UserModel })
  @ApiBearerAuth('defaultToken')
  @UseGuards(AdminGuard)
  @Get(':id')
  getAllUsers(@Param('id') id: number): Promise<User> {
    return this.userService.findById(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: UserModel })
  @Get('getUserByEmail/:email')
  getUserByEmail(@Param('email') email: string): Promise<User> {
    return this.userService.getUserByEmail(email);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: String })
  @Post('verify')
  verifyUser(@Body() dto: VerifyDto): Promise<string> {
    return this.userService.verifyUser({
      email: dto.email,
      username: dto.username,
    });
  }
}
