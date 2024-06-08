import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { AdminGuard, UserGuard } from 'src/auth/guard/auth.guard';
import { UserModel } from './model/user.model';
import { User } from '@prisma/client';
import { VerifyDto } from './dto/verify.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { UserType } from 'src/helpers/types';
import { UpdateDto } from './dto/update.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: UserModel })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get(':id')
  getAllUsers(@Param('id') id: number): Promise<UserModel> {
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

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: UserModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('profile/my')
  getMyProfile(@GetUser() user: UserType): Promise<UserModel> {
    console.log('user', user);
    return this.userService.findById(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: UserModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Put('profile/update')
  updateProfile(
    @Body() dto: UpdateDto,
    @GetUser() user: UserType,
  ): Promise<UserModel> {
    return this.userService.updateProfile(user, dto);
  }
}
