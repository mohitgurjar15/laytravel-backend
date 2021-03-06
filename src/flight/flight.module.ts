import { CacheModule, Module } from '@nestjs/common';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportRepository } from './airport.repository';
import { PaymentService } from 'src/payment/payment.service';
import { BookingRepository } from 'src/booking/booking.repository';
import { InstalmentService } from 'src/instalment/instalment.service';

@Module({
  imports:[
    AuthModule,
    CacheModule.register(),
    TypeOrmModule.forFeature(
      [
      AirportRepository,BookingRepository
      ]),
  ],
  controllers: [FlightController],
  providers: [FlightService, PaymentService , InstalmentService],
})
export class FlightModule {}
