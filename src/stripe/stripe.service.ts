import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserType } from 'src/helpers/types';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { PurchaseModel } from './model/purchase.model';
import { ETicketService } from 'src/e-ticket/e-ticket.service';
import { MailService } from 'src/mail/mail.service';
import moment from 'moment';

interface GraphData {
  name: string;
  total: number;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    private prismaService: PrismaService,
    private eTicketService: ETicketService,
    private mailService: MailService,
  ) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY ||
        'sk_test_51PHqG7LJQdX1xHJiTbLebcP4LBi81BZFm7CoMsGqHcsYNUnJqhJWrZ7RscTbIISd1bFa0YiiNjrmXU6HqGWokxrG009VFdBne0',
      {
        apiVersion: '2023-10-16',
        typescript: true,
      },
    );
  }

  async getBilling(): Promise<PurchaseModel[]> {
    const billing = await this.prismaService.purchase.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        event: {
          include: {
            ETicketBook: true,
          },
        },
      },
    });

    return plainToInstance(PurchaseModel, billing);
  }

  async getTotalRevenue() {
    const paidOrders = await this.prismaService.purchase.findMany({
      include: {
        event: {
          include: {
            ETicketBook: true,
          },
        },
      },
    });

    const totalRevenue = paidOrders.reduce((total, order) => {
      return total + Number(order.event.ETicketBook.price);
    }, 0);

    return totalRevenue;
  }

  async getSalesCount() {
    const sales = await this.prismaService.purchase.count();
    return sales;
  }

  async getGraphRevenue() {
    const paidOrders = await this.prismaService.purchase.findMany({
      include: {
        event: {
          include: {
            ETicketBook: true,
          },
        },
      },
    });

    const monthlyRevenue: { [key: number]: number } = {};

    for (const order of paidOrders) {
      const month = order.createdAt.getMonth();
      const revenueForOrder = Number(order.event.ETicketBook.price);

      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
    }

    const graphData: GraphData[] = [
      { name: 'Jan', total: 0 },
      { name: 'Feb', total: 0 },
      { name: 'Mar', total: 0 },
      { name: 'Apr', total: 0 },
      { name: 'May', total: 0 },
      { name: 'Jun', total: 0 },
      { name: 'Jul', total: 0 },
      { name: 'Aug', total: 0 },
      { name: 'Sep', total: 0 },
      { name: 'Oct', total: 0 },
      { name: 'Nov', total: 0 },
      { name: 'Dec', total: 0 },
    ];

    // Filling in the revenue data
    for (const month in monthlyRevenue) {
      graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
    }

    return graphData;
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

      const customer = await this.prismaService.stripeCustomer.findUnique({
        where: {
          userId,
        },
      });

      const user = await this.prismaService.user.findUnique({
        where: {
          id: +userId,
        },
      });

      const event = await this.prismaService.event.findUnique({
        where: {
          id: +eventId,
        },
        include: {
          location: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!event) {
        throw new Error('Event not found');
      }

      await this.prismaService.purchase.create({
        data: {
          eventId: +eventId,
          userId: +userId,
          stripeCheckoutSessionId: session.id,
          stripeCustomerId: customer.stripeCustomerId,
          // stripeSubscriptionId: session.subscriptio,
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
      const qrCodes: string[] = [];

      for (let i = 0; i < +quantity; i++) {
        const eTicket = await this.eTicketService.createETicket(
          {
            price: eTicketBook.price,
            serialNo: Math.random().toString(36).substring(7),
            currency: eTicketBook.currency,
            eventId: +eventId,
            eTicketBookId: eTicketBook.id,
          },
          +userId,
        );

        const dataQR = {
          qrCode: eTicket.QrCode,
          eTicketId: eTicket.id,
          eventId: eTicket.eventId,
        };

        const encodedData = encodeURIComponent(JSON.stringify(dataQR));

        qrCodes.push(encodedData);
      }
      const minutes = event.start_time.getMinutes().toString().padStart(2, '0');
      const hours = event.start_time.getHours().toString().padStart(2, '0');
      const day = event.start_time.getDate().toString().padStart(2, '0');
      const month = (event.start_time.getMonth() + 1)
        .toString()
        .padStart(2, '0'); // Months are 0-based in JS
      const year = event.start_time.getFullYear();
      const formattedDate = `${minutes}-${hours}-${day}-${month}-${year}`;
      console.log('formattedDate', formattedDate);
      await this.mailService.sendPurchaseETicketEmail(
        { name: user.name, email: user.email },
        {
          qrCodes,
          nameEvent: event.name,
          venue: event.location.address,
          startDate: formattedDate,
        },
      );
    }
  }
}
