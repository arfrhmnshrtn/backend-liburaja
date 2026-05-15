import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  /**
   * 1. Admin Create Voucher
   */
  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  /**
   * 2. Get Available Voucher (All)
   */
  @Get('available')
  getAvailableVouchers() {
    return this.vouchersService.getAvailableVouchers();
  }

  /**
   * 3. Get Available Voucher for Logged In User
   */
  @UseGuards(JwtAuthGuard)
  @Get('available-for-me')
  getAvailableVouchersForUser(@Req() req) {
    return this.vouchersService.getAvailableVouchersForUser(req.user.sub);
  }
  /**
   * 3. Admin Get Voucher Usages (History)
   */
  @Get(':id/usages')
  getVoucherUsages(@Param('id') id: string) {
    return this.vouchersService.getVoucherUsages(id);
  }
}
