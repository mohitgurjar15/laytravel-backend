import { Module } from '@nestjs/common';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportRepository } from './airport.repository';
import { PaymentService } from 'src/payment/payment.service';

@Module({
  imports:[
    AuthModule,
    TypeOrmModule.forFeature(
      [
        AirportRepository
      ]),
  ],
  controllers: [FlightController],
  providers: [FlightService, PaymentService]
})
export class FlightModule {}
