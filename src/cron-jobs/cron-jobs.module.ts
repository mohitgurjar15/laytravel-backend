import { Module } from '@nestjs/common';
import { CronJobsController } from './cron-jobs.controller';
import { CronJobsService } from './cron-jobs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { FlightService } from 'src/flight/flight.service';
import { PaymentService } from 'src/payment/payment.service';
import { BookingRepository } from 'src/booking/booking.repository';
import { AirportRepository } from 'src/flight/airport.repository';
import { InstalmentService } from 'src/instalment/instalment.service';
import { VacationRentalService } from 'src/vacation-rental/vacation-rental.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([UserRepository,AirportRepository,BookingRepository]),
    AuthModule
  ],
  controllers: [CronJobsController],
  providers: [CronJobsService,FlightService,PaymentService,BookingRepository,InstalmentService,VacationRentalService]
})
export class CronJobsModule {}
