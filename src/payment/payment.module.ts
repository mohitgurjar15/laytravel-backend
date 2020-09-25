import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AuthModule } from 'src/auth/auth.module';
import { BookingRepository } from 'src/booking/booking.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([BookingRepository]),AuthModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}
