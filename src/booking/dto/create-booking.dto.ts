export class CreateBookingDto {
  bookingCode: string;
  userId: number;
  packageId: number;
  date: Date;
  quantity: number;
  totalPrice: number;
  voucherCode?: string;
}
