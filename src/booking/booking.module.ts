import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentService } from 'src/payment/payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookingRepository]), AuthModule],
  controllers: [BookingController],
  providers: [BookingService,PaymentService],
})
export class BookingModule {}
