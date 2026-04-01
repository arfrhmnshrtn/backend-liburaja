import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { MidtransService } from '../midtrans/midtrans.service';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private midtransService: MidtransService,
  ) {}

  async create(userId: number, createBookingDto: CreateBookingDto) {
    // 🔹 ambil data package
    const paket = await this.prisma.package.findUnique({
      where: { id: createBookingDto.packageId },
    });

    if (!paket) {
      throw new NotFoundException('Paket tidak ditemukan');
    }

    // 🔹 hitung total harga
    const totalPrice = paket.price * createBookingDto.quantity;

    // 🔹 simpan booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        packageId: createBookingDto.packageId,
        date: new Date(createBookingDto.date),
        quantity: createBookingDto.quantity,
        totalPrice,
        status: 'PENDING',
      },
    });

    // 🔥 PANGGIL MIDTRANS (INI YANG KURANG)
    const transaction = await this.midtransService.createTransaction(
      `ORDER-${booking.id}`,
      totalPrice,
      {
        first_name: 'User',
        email: 'user@mail.com',
      },
    );

    return {
      success: true,
      message: 'Booking berhasil dibuat',
      data: booking,
      snapToken: transaction.token, // 🔥 INI YANG KAMU CARI
      redirectUrl: transaction.redirect_url,
    };
  }

  findAll() {
    // return `This action returns all booking`;
    return this.prisma.booking.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  async remove(id: number) {
    // return `This action removes a #${id} booking`;
    try {
      const data = await this.prisma.booking.delete({
        where: { id },
      });

      if (data.status == 'PENDING') {
        return {
          success: true,
          message: 'Booking berhasil dihapus',
          data,
        };
      }

      return {
        success: false,
        message: 'Booking gagal dihapus',
        data,
      };
    } catch (error) {
      throw new NotFoundException('Booking tidak ditemukan');
    }
  }
}
