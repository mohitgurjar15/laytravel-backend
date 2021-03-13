import { CacheModule, Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentService } from 'src/payment/payment.service';
import { FlightService } from 'src/flight/flight.service';
import { InstalmentService } from 'src/instalment/instalment.service';
import { MailerService } from '@nestjs-modules/mailer';
import { AirportRepository } from 'src/flight/airport.repository';

@Module({
    imports: [
        AuthModule,
        CacheModule.register(),
        TypeOrmModule.forFeature([AirportRepository, BookingRepository]),
    ],
    controllers: [BookingController],
    providers: [
        BookingService,
        PaymentService,
        FlightService,
        InstalmentService,
    ],
})
export class BookingModule {}
