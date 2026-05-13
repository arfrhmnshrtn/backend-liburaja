import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { PackagesModule } from './package/packages.module';
import { BookingModule } from './booking/booking.module';
import { PaymentsModule } from './payments/payments.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    PackagesModule,
    BookingModule,
    PaymentsModule,
    BookmarksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
