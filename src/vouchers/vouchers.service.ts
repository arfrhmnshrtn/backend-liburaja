import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { VoucherHelper } from './helpers/voucher.helper';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 1. Admin Create Voucher
   */
  async create(createVoucherDto: CreateVoucherDto) {
    const { code, discountValue, maxDiscount, minPurchase, ...rest } = createVoucherDto;

    // Check if code is unique
    const existingVoucher = await this.prisma.voucher.findUnique({
      where: { code },
    });

    if (existingVoucher) {
      throw new ConflictException('Voucher code already exists');
    }

    const voucher = await this.prisma.voucher.create({
      data: {
        code,
        discountValue: new Prisma.Decimal(discountValue),
        maxDiscount: maxDiscount !== undefined ? new Prisma.Decimal(maxDiscount) : null,
        minPurchase: minPurchase !== undefined ? new Prisma.Decimal(minPurchase) : null,
        ...rest,
      },
    });

    return {
      success: true,
      message: 'Voucher berhasil dibuat',
      data: voucher,
    };
  }

  /**
   * 2. Get Available Voucher
   */
  async getAvailableVouchers() {
    const now = new Date();
    
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now, // startDate sudah dimulai
        },
        endDate: {
          gte: now, // belum expired
        },
        // kuota masih tersedia (quota > usedCount)
        // Since Prisma doesn't support comparing columns directly in where easily without raw query or special preview features,
        // we can filter them after fetching, or using a raw query.
        // It's safer to fetch and filter, or we use a basic filter and then array filter.
      },
    });

    // Filter valid quota
    const availableVouchers = vouchers.filter(v => v.quota > v.usedCount);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil mendapatkan voucher yang tersedia',
      metadata: { count: availableVouchers.length },
      data: availableVouchers,
    };
  }


  /**
   * 3. Get Available Voucher for Logged In User
   */
  async getAvailableVouchersForUser(userId: number) {
    const now = new Date();
    
    // Fetch active vouchers, unexpired, started
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        // Hanya ambil riwayat penggunaan untuk user yang sedang login
        voucherUsages: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    // 1. Filter kuota masih tersedia secara global
    // 2. Filter pemakaian user (voucherUsages.length) belum mencapai limit (userLimit)
    const availableVouchers = vouchers
      .filter((v) => v.quota > v.usedCount)
      .filter((v) => v.voucherUsages.length < v.userLimit)
      .map((v) => {
        // Hilangkan property voucherUsages agar response lebih clean
        const { voucherUsages, ...rest } = v;
        return rest;
      });

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil mendapatkan voucher yang tersedia untuk Anda',
      metadata: { count: availableVouchers.length },
      data: availableVouchers,
    };
  }

  /**
   * 3. Admin Get Voucher Usages (History)
   */
  async getVoucherUsages(id: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher tidak ditemukan');
    }

    const usages = await this.prisma.voucherUsage.findMany({
      where: { voucherId: id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        booking: {
          select: {
            bookingCode: true,
            package: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        usedAt: 'desc',
      },
    });

    const mappedData = usages.map((usage) => ({
      id: usage.id,
      usedAt: usage.usedAt,
      user: {
        name: usage.user.name,
        email: usage.user.email,
      },
      booking: {
        bookingCode: usage.booking.bookingCode,
        packageName: usage.booking.package.name,
      },
    }));

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Berhasil mendapatkan riwayat penggunaan voucher',
      metadata: { count: mappedData.length },
      data: mappedData,
    };
  }

}
