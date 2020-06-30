import { Module } from '@nestjs/common';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { AuthModule } from 'src/auth/auth.module';
import { FlightRepository } from './flight.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    AuthModule,
    TypeOrmModule.forFeature([FlightRepository]),
  ],
  controllers: [FlightController],
  providers: [FlightService]
})
export class FlightModule {}
