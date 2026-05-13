import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from 'src/prisma.service';

interface MidtransWebhookPayload {
  order_id: string;
  status: string;
  [key: string]: any;
}

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private prisma: PrismaService,
  ) {}

  @Post('midtrans/webhook')
  async handleWebhook(@Body() body: MidtransWebhookPayload) {
    const bookingId = parseInt(body.order_id.split('-')[1], 10);
    const status = body.transaction_status as string;
    const fraud = body.fraud_status as string;

    if (status === 'capture') {
      if (fraud === 'accept') {
        await this.prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'PAID' },
        });
      }
    }

    if (status === 'settlement') {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'PAID' },
      });
    }

    return { message: 'OK' };
  }
}
