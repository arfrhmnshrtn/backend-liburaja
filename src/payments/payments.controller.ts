import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
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
    // const orderId = body.orderId;
    console.log('webhook received:');
    const bookingId = parseInt(body.order_id.split('-')[1], 10);
    // const transactionStatus = body.status;
    const status = body.transaction_status as string;
    const fraud = body.fraud_status as string;

    console.log('Webhook Payload:', body);

    console.log('Booking ID:', bookingId);
    // console.log('Transaction Status:', transactionStatus);

    // const bookingId = parseInt(orderId.split('-')[1]);

    // console.log()

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

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
