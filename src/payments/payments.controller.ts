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

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('midtrans/webhook')
  async handleWebhook(@Body() body: CreatePaymentDto) {
    // const orderId = body.orderId;
    const bookingId = body.bookingId;
    const transactionStatus = body.status;

    // const bookingId = parseInt(orderId.split('-')[1]);

    if (transactionStatus === 'settlement') {
      this.paymentsService.update(bookingId, {
        status: 'PAID',
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
