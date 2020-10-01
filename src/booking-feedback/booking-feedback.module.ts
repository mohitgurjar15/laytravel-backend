import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { BookingFeedbackController } from './booking-feedback.controller';
import { BookingFeedbackRepositery } from './booking-feedback.repository';
import { BookingFeedbackService } from './booking-feedback.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookingFeedbackRepositery]), AuthModule],
  controllers: [BookingFeedbackController],
  providers: [BookingFeedbackService]
})
export class BookingFeedbackModule {}
