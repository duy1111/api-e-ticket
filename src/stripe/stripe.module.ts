import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    // Stripe.forRootAsync(Stripe, {
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     apiKey: config.get('STRIPE_SECRET_KEY') || '',
    //     webhookConfig: {
    //       stripeWebhookSecret: config.get('STRIPE_WEBHOOK_SECRET') || '',
    //     },
    //   }),
    // }),
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
@Global()
export class StripeModule {}
