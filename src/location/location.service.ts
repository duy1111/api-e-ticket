import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationModel } from './model/location.model';
import { Location } from '@prisma/client';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async createLocation(data: CreateLocationDto) {
    return await this.prisma.location.create({
      data,
    });
  }
}
