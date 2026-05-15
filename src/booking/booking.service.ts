import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MidtransService } from '../midtrans/midtrans.service';
import { metadata } from 'reflect-metadata/no-conflict';
import { nanoid } from 'nanoid';
import { VoucherHelper } from '../vouchers/helpers/voucher.helper';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private midtransService: MidtransService,
  ) {}

  async create(
    userId: number,
    createBookingDto: CreateBookingDto,
  ) {
    const { packageId, quantity, date, voucherCode } = createBookingDto;

    // Gunakan Prisma transaction untuk atomic operation (Booking + Voucher Usage)
    return this.prisma.$transaction(async (tx) => {
      // 1. Ambil data package
      const paket = await tx.package.findUnique({
        where: { id: packageId },
      });

      if (!paket) {
        throw new NotFoundException('Paket tidak ditemukan');
      }

      // 2. Hitung harga awal
      const originalPrice = paket.price * quantity;
      let finalPrice = originalPrice;
      let discountAmount = 0;
      let appliedVoucherId: string | null = null;

      // 3. Proses voucher jika user memasukkan voucherCode
      if (voucherCode) {
        const voucher = await tx.voucher.findUnique({
          where: { code: voucherCode },
        });

        if (!voucher) {
          throw new NotFoundException('Voucher tidak ditemukan');
        }

        const userUsages = await tx.voucherUsage.findMany({
          where: { voucherId: voucher.id, userId },
        });

        // Validasi ketersediaan voucher. Akan melempar Exception (Opsi A) jika gagal.
        VoucherHelper.validateVoucherAvailability(voucher, userUsages, originalPrice);

        // Hitung diskon
        discountAmount = VoucherHelper.calculateDiscount(voucher, originalPrice);
        finalPrice = originalPrice - discountAmount;
        if (finalPrice < 0) finalPrice = 0;

        appliedVoucherId = voucher.id;

        // Tambah counter pemakaian voucher
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      // 4. Generate booking code
      const bookingCode = `TRX-${nanoid(4).toUpperCase()}`;

      // 5. Simpan booking ke database dengan harga final
      const booking = await tx.booking.create({
        data: {
          bookingCode: bookingCode,
          userId: userId,
          packageId: packageId,
          date: new Date(date),
          quantity: quantity,
          totalPrice: finalPrice,
          status: 'PENDING',
        },
      });

      // 6. Jika pakai voucher, simpan riwayat penggunaan (VoucherUsage)
      if (appliedVoucherId) {
        await tx.voucherUsage.create({
          data: {
            voucherId: appliedVoucherId,
            userId: userId,
            bookingId: booking.id,
          },
        });
      }

      // 7. PANGGIL MIDTRANS dengan finalPrice
      // Jika finalPrice = 0, secara ideal langsung auto PENDING/PAID tanpa payment gateway,
      // tetapi untuk saat ini asumsikan kita bypass ke midtrans.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const transaction: { token: string; redirect_url: string } =
        await this.midtransService.createTransaction(
          `ORDER-${booking.id}`,
          finalPrice,
          paket.name,
        );

      return {
        success: true,
        message: voucherCode ? 'Booking berhasil dibuat dengan voucher' : 'Booking berhasil dibuat',
        data: booking,
        discount: discountAmount,
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    });
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

  async cancel(id: number, user: { sub: number; role: string }) {
    // 🔹 cek dulu booking
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (booking.userId !== user.sub && user.role !== 'ADMIN') {
      throw new ForbiddenException('Anda tidak berhak menghapus booking ini');
    }

    if (booking.status === 'CANCELED') {
      return {
        success: false,
        message: 'Booking sudah dibatalkan!',
        data: booking,
      };
    }

    // 🔹 hanya boleh hapus jika masih PENDING
    if (booking.status !== 'PENDING' ) {
      return {
        success: false,
        message: 'Booking tidak bisa dibatalkan!',
      };
    }

    // 🔹 baru delete
    await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELED',
      },
    });

    return {
      success: true,
      message: 'Booking berhasil dibatalkan',
      data: booking,
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
