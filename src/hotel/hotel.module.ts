import { CacheModule, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentService } from 'src/payment/payment.service';
import { Generic } from './helpers/generic.helper';
import { RateHelper } from './helpers/rate.helper';
import { UserHelper } from './helpers/user.helper';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import * as redisStore from 'cache-manager-redis-store';
import { BookingHelper } from './helpers/booking.helper';

@Module({
  controllers: [HotelController],
  providers: [
    HotelService,
    Generic,
    RateHelper,
    UserHelper,
    BookingHelper,
    PaymentService
  ],
  imports: [
    AuthModule,
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    })
  ]
})
export class HotelModule {}
