import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ETicketService } from './e-ticket.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { APISummaries } from 'src/helpers/helpers';
import { ETicketModel } from './model/e-ticket.model';
import { CreateETicketDto } from './dto/e-ticket.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { UserType } from 'src/helpers/types';
import { scanETicketDto } from './dto/scan-e-ticket.dto';
import { AdminGuard, UserGuard } from 'src/auth/guard/auth.guard';
import { SendETicketDto } from './dto/send-e-ticket.dto';

@ApiTags('e-ticket')
@Controller('e-ticket')
export class ETicketController {
  constructor(private readonly eTicketService: ETicketService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ETicketModel })
  @ApiBearerAuth()
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post('/create')
  async createETicket(
    @Body() data: CreateETicketDto,
    @GetUser() user: UserType,
  ): Promise<ETicketModel> {
    return await this.eTicketService.createETicket(data, user.id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ETicketModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('/getETicketById/:id')
  async getETicketById(@Param('id') id: number): Promise<ETicketModel> {
    return await this.eTicketService.getETicketById(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: [ETicketModel] })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('/all-ticket-by-user')
  async getAllETickets(@GetUser() user: UserType): Promise<ETicketModel[]> {
    return await this.eTicketService.getAllETicketsByUserId(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: [ETicketModel] })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('/all')
  async getAllETicket(): Promise<ETicketModel[]> {
    return await this.eTicketService.getAllETickets();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ETicketModel })
  @Post('/scan')
  async scanETicket(@Body() dto: scanETicketDto): Promise<ETicketModel> {
    console.log('scanETicket', dto);
    return await this.eTicketService.scanETicket(
      dto.qrCode,
      dto.eTicketId,
      dto.eTicketId,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @Post('/sendETicket')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  async sendETicket(@GetUser() user: UserType, @Body() params: SendETicketDto) {
    return await this.eTicketService.sendETicket(params, user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @Delete('/delete/:id')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  async deleteETicket(@Param('id') id: number) {
    return await this.eTicketService.deleteETicket(id);
  }
}
