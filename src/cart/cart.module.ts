import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserRepository } from 'src/auth/user.repository';
import { BookingRepository } from 'src/booking/booking.repository';
import { CronJobsService } from 'src/cron-jobs/cron-jobs.service';
import { AirportRepository } from 'src/flight/airport.repository';
import { FlightService } from 'src/flight/flight.service';
import { HotelModule } from 'src/hotel/hotel.module';
import { HotelService } from 'src/hotel/hotel.service';
import { InstalmentService } from 'src/instalment/instalment.service';
import { PaymentService } from 'src/payment/payment.service';
import { TwilioSMS } from 'src/utility/sms.utility';
import { VacationRentalService } from 'src/vacation-rental/vacation-rental.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports:[
    AuthModule,
    CacheModule.register(),
    TypeOrmModule.forFeature(
      [
        UserRepository,AirportRepository,BookingRepository
      ]),
    HotelModule
  ],
  controllers: [CartController],
  providers: [CartService,CronJobsService,FlightService,PaymentService,BookingRepository,InstalmentService,VacationRentalService,TwilioSMS]
  
})
export class CartModule {}
