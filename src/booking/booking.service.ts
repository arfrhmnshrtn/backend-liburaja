import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    // 🔹 ambil data package
    const paket = await new PrismaService().package.findUnique({
      where: { id: createBookingDto.packageId },
    });

    // 🔹 validasi package
    if (!paket) {
      throw new NotFoundException('Paket tidak ditemukan');
    }

    // 🔹 hitung total harga dari database
    const totalPrice = paket.price * createBookingDto.quantity;

    // 🔹 simpan booking
    const booking = await new PrismaService().booking.create({
      data: {
        userId: createBookingDto.userId,
        packageId: createBookingDto.packageId,
        date: new Date(createBookingDto.date),
        quantity: createBookingDto.quantity,
        totalPrice,
      },
    });

    return {
      success: true,
      message: 'Booking berhasil dibuat',
      data: booking,
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

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
