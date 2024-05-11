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
import { ETicketService } from './e-ticket.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { APISummaries } from 'src/helpers/helpers';
import { ETicketModel } from './model/e-ticket.model';
import { CreateETicketDto } from './dto/e-ticket.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { UserType } from 'src/helpers/types';

@ApiTags('e-ticket')
@Controller('e-ticket')
export class ETicketController {
  constructor(private readonly eTicketService: ETicketService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ETicketModel })
  @UseGuards(UseGuards)
  @Post('create')
  async createETicket(@Body() data: CreateETicketDto): Promise<ETicketModel> {
    return await this.eTicketService.createETicket(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ETicketModel })
  @UseGuards(UseGuards)
  @Get(':id')
  async getEticketById(@Param('id') id: number): Promise<ETicketModel> {
    return await this.eTicketService.getETicketById(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: [ETicketModel] })
  @UseGuards(UseGuards)
  @Get('/all-ticket-by-user')
  async getAllETickets(@GetUser() user: UserType): Promise<ETicketModel[]> {
    return await this.eTicketService.getAllETicketsByUserId(user.id);
  }
}
