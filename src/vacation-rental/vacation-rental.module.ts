import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { BookingRepository } from 'src/booking/booking.repository';
import { PaymentService } from 'src/payment/payment.service';
import { TwilioSMS } from 'src/utility/sms.utility';
import { VacationRentalController } from './vacation-rental.controller';
import { VacationRentalService } from './vacation-rental.service';

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature(
            [
                BookingRepository
            ]),
    ],
    controllers: [VacationRentalController],
    providers: [VacationRentalService,PaymentService],
})
export class VacationRentalModule { }
