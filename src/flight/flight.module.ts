import { Module } from '@nestjs/common';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportRepository } from './airport.repository';
import { PaymentService } from 'src/payment/payment.service';
import { BookingRepository } from 'src/booking/booking.repository';

@Module({
  imports:[
    AuthModule,
    TypeOrmModule.forFeature(
      [
        AirportRepository,BookingRepository
      ]),
  ],
  controllers: [FlightController],
  providers: [FlightService, PaymentService]
})
export class FlightModule {}
