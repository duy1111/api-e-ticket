import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestWithRawBody } from 'src/helpers/interfaces';
import { StripeService } from './stripe.service';
import { UserType } from 'src/helpers/types';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreateCheckoutDto } from './dto/checkout.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard, UserGuard } from 'src/auth/guard/auth.guard';
import { PurchaseModel } from './model/purchase.model';

@Controller('')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/checkout-session')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  checkoutSession(
    @GetUser() user: UserType,
    @Body() dto: CreateCheckoutDto,
  ): Promise<any> {
    return this.stripeService.checkoutSession(user, dto.eventId, dto.quantity);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/webhook')
  webhookReceiver(
    @Req() req: RequestWithRawBody,
    @Headers('stripe-signature') signature: string,
  ): void {
    this.stripeService.webhookReceiver(req.rawBody, signature);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/billing')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async getBilling(): Promise<PurchaseModel[]> {
    return await this.stripeService.getBilling();
  }

  @HttpCode(HttpStatus.OK)
  @Get('/getTotalRevenue')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async getTotalRevenue(): Promise<number> {
    return await this.stripeService.getTotalRevenue();
  }

  @HttpCode(HttpStatus.OK)
  @Get('/getSalesCount')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async getSalesCount(): Promise<number> {
    return await this.stripeService.getSalesCount();
  }

  @HttpCode(HttpStatus.OK)
  @Get('/getGraphRevenue')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async getGraphRevenue(): Promise<any[]> {
    return await this.stripeService.getGraphRevenue();
  }
}
