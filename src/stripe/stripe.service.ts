import { BadRequestException, Injectable } from '@nestjs/common';
import e from 'express';
import { UserType } from 'src/helpers/types';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(private prismaService: PrismaService) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY ||
        'sk_test_51PHqG7LJQdX1xHJiTbLebcP4LBi81BZFm7CoMsGqHcsYNUnJqhJWrZ7RscTbIISd1bFa0YiiNjrmXU6HqGWokxrG009VFdBne0',
      {
        apiVersion: '2023-10-16',
        typescript: true,
      },
    );
  }

  async checkoutSession(user: UserType, eventId: number, quantity: number) {
    const event = await this.prismaService.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        ETicketBook: true,
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const eTicketBook = await this.prismaService.eTicketBook.findUnique({
      where: {
        eventId: event.id,
      },
    });

    if (!eTicketBook) {
      throw new Error('ETicketBook not found');
    }

    if (eTicketBook.sold + quantity > eTicketBook.total) {
      throw new Error('Not enough tickets');
    }

    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    // if (
    //   eTicketBook.startTime < new Date() ||
    //   eTicketBook.closeTime < new Date()
    // ) {
    //   throw new Error('Event has already started or ended');
    // }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: event.name,
            description: event.description,
            images: [event.imageUrl],
          },
          unit_amount: +event.ETicketBook.price * 100,
        },
        quantity,
      },
    ];

    let stripeCustomer = await this.prismaService.stripeCustomer.findUnique({
      where: {
        userId: user.id.toString(),
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!stripeCustomer) {
      const customer = await this.stripe.customers.create({
        email: user.email,
      });

      stripeCustomer = await this.prismaService.stripeCustomer.create({
        data: {
          userId: user.id.toString(),
          stripeCustomerId: customer.id,
        },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomer.stripeCustomerId,
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=1`,
      metadata: {
        eventId: event.id,
        userId: user.id,
        quantity: quantity,
      },
    });

    return {
      url: session.url,
    };
  }

  async webhookReceiver(body: any, signature: string) {
    let event: Stripe.Event;
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error: any) {
      throw new Error(`Webhook Error: ${error.message}`);
    }

    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session?.metadata?.userId;
    const eventId = session?.metadata?.eventId;
    const quantity = session?.metadata?.quantity;

    if (event.type === 'checkout.session.completed') {
      if (!userId || !eventId) {
        throw new Error('Webhook Error: Missing metadata');
      }

      await this.prismaService.purchase.create({
        data: {
          eventId: +eventId,
          userId: +userId,
        },
      });

      const eTicketBook = await this.prismaService.eTicketBook.findUnique({
        where: {
          eventId: +eventId,
        },
      });

      if (!eTicketBook) {
        throw new Error('ETicketBook not found');
      }

      const sold = Number(eTicketBook.sold) + Number(quantity);

      await this.prismaService.eTicketBook.update({
        where: {
          eventId: +eventId,
        },
        data: {
          sold,
        },
      });

      await this.prismaService.eTicket.createMany({
        data: Array.from({ length: +quantity }).map(() => ({
          userId: +userId,
          eventId: +eventId,
          price: eTicketBook.price,
          serialNo: Math.random().toString(36).substring(7),
          currency: eTicketBook.currency,
          eTicketBookId: eTicketBook.id,
        })),
      });
    }
  }
}
