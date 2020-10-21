import { Module } from '@nestjs/common';
import { RewordPointController } from './reword-point.controller';
import { RewordPointService } from './reword-point.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewordPointEarnRepository } from './reword-point-earn.repository';
import { RewordPointRedeemRepository } from './roword-point-redeem.repository';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentService } from 'src/payment/payment.service';
import { BookingRepository } from 'src/booking/booking.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RewordPointEarnRepository,RewordPointRedeemRepository,BookingRepository]), AuthModule],
  controllers: [RewordPointController],
  providers: [RewordPointService , PaymentService]
})
export class RewordPointModule {}
