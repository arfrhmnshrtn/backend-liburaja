import { Injectable } from '@nestjs/common';
import * as midtransClient from 'midtrans-client';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class MidtransService {
  private snap;

  constructor(private configService: ConfigService) {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: this.configService.get<string>('MIDTRANS_SERVER_KEY'),
    });
  }

  async createTransaction(orderId: string, amount: number, customer: any) {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: customer,
    };

    const transaction = await this.snap.createTransaction(parameter);

    return transaction;
  }
}
