import { Module } from '@nestjs/common';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { AuthModule } from 'src/auth/auth.module';
import { FlightRepository } from './flight.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportRepository } from './airport.repository';
import { SeatAllocationRepository } from './seat-allocation.repository';

@Module({
  imports:[
    AuthModule,
    TypeOrmModule.forFeature(
      [
        FlightRepository,
        AirportRepository,
        SeatAllocationRepository
      ]),
  ],
  controllers: [FlightController],
  providers: [FlightService]
})
export class FlightModule {}
