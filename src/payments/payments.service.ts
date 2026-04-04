import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/prisma.service';
import { metadata } from 'reflect-metadata/no-conflict';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  async findOne(id: number) {
    const data = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!data) {
      throw new NotFoundException('Data booking tidak ditemukan');
    }

    return {
      success: true,
      message: 'Data booking berhasil ditemukan',
      data,
    };
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
