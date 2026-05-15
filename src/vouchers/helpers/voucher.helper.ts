import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Voucher, VoucherUsage, Booking } from '../../generated/prisma/client.js';

export class VoucherHelper {
  /**
   * Validasi kelayakan voucher untuk digunakan pada suatu booking
   */
  static validateVoucherAvailability(
    voucher: Voucher,
    userUsages: VoucherUsage[],
    bookingPrice: number,
  ) {
    if (!voucher) {
      throw new NotFoundException('Voucher tidak ditemukan');
    }

    if (!voucher.isActive) {
      throw new BadRequestException('Voucher sudah tidak aktif');
    }

    const now = new Date();
    if (now < voucher.startDate) {
      throw new BadRequestException('Voucher belum dapat digunakan saat ini');
    }

    if (now > voucher.endDate) {
      throw new BadRequestException('Voucher sudah kadaluarsa');
    }

    if (voucher.quota - voucher.usedCount <= 0) {
      throw new BadRequestException('Kuota voucher sudah habis');
    }

    if (userUsages.length >= voucher.userLimit) {
      throw new ForbiddenException('Anda telah mencapai batas penggunaan maksimal untuk voucher ini');
    }

    const minPurchase = voucher.minPurchase ? Number(voucher.minPurchase) : 0;
    
    if (minPurchase > 0 && bookingPrice < minPurchase) {
      throw new BadRequestException(`Minimal pembelian untuk menggunakan voucher ini adalah ${minPurchase}`);
    }
  }

  /**
   * Menghitung nilai diskon yang akan diterapkan
   */
  static calculateDiscount(voucher: Voucher, originalPrice: number): number {
    let discount = 0;

    if (voucher.discountType === 'PERCENTAGE') {
      const percentageValue = Number(voucher.discountValue) / 100;
      discount = originalPrice * percentageValue;
      
      const maxDiscount = voucher.maxDiscount ? Number(voucher.maxDiscount) : null;
      if (maxDiscount !== null && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else if (voucher.discountType === 'FIXED') {
      discount = Number(voucher.discountValue);
    }

    return discount;
  }
}
