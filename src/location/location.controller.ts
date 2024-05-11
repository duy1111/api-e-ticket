import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { APISummaries } from 'src/helpers/helpers';
import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from '@prisma/client';
import { LocationModel } from './model/location.model';

@ApiTags('location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: LocationModel })
  @Post('create')
  async createLocation(@Body() data: CreateLocationDto) {
    return await this.locationService.createLocation(data);
  }
}
