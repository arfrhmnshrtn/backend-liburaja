import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { MidtransService } from '../midtrans/midtrans.service';
import { metadata } from 'reflect-metadata/no-conflict';
import { nanoid } from 'nanoid';


@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private midtransService: MidtransService,
  ) {}

  async create(
    userId: number,
    // name: string,
    // email: string,
    createBookingDto: CreateBookingDto,
  ) {
    // 🔹 ambil data package
    const paket = await this.prisma.package.findUnique({
      where: { id: createBookingDto.packageId },
    });

    if (!paket) {
      throw new NotFoundException('Paket tidak ditemukan');
    }

    // 🔹 hitung total harga
    const totalPrice = paket.price * createBookingDto.quantity;

    const bookingCode = `TRX-${nanoid(4).toUpperCase()}`;

    // 🔹 simpan booking
    const booking = await this.prisma.booking.create({
      data: {
        bookingCode: bookingCode,
        userId: userId,
        packageId: createBookingDto.packageId,
        date: new Date(createBookingDto.date),
        quantity: createBookingDto.quantity,
        totalPrice,
        status: 'PENDING',
      },
    });

    // PANGGIL MIDTRANS
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const transaction: { token: string; redirect_url: string } =
      await this.midtransService.createTransaction(
        `ORDER-${booking.id}`,
        totalPrice,
        paket.name,
      );

    return {
      success: true,
      message: 'Booking berhasil dibuat',
      data: booking,
      snapToken: transaction.token, // 🔥 INI YANG KAMU CARI
      redirectUrl: transaction.redirect_url,
    };
  }

  async findAll() {
    // return `This action returns all booking`;
    const bookings = await this.prisma.booking.findMany();
    return {
      success: true,
      message: 'Data booking berhasil ditemukan',
      metadata: { status: HttpStatus.OK, count: bookings.length },
      data: bookings,
    };
  }

  // findOne(id: number) {
  //   return this.prisma.booking.findUnique({
  //     where: { id },
  //   });
  // }

  // update(id: number, updateBookingDto: UpdateBookingDto) {
  //   return `This action updates a #${id} booking`;
  // }

  async remove(id: number) {
    // 🔹 cek dulu booking
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    // 🔹 hanya boleh hapus jika masih PENDING
    if (booking.status !== 'PENDING') {
      return {
        success: false,
        message: 'Booking tidak bisa dihapus karena sudah dibayar',
      };
    }

    // 🔹 baru delete
    await this.prisma.booking.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Booking berhasil dihapus',
    };
  }

  async findByUser(userId: number) {
    const data = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        package: true,
      },
    });

    return {
      success: true,
      message: 'Berhasil mengambil riwayat booking',
      metadata: {
        count: data.length,
      },
      data,
    };
  }
}
