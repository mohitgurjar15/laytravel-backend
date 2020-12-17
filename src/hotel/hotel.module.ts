import { CacheModule, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Generic } from './helpers/generic.helper';
import { RateHelper } from './helpers/rate.helper';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';

@Module({
  controllers: [HotelController],
  providers: [
    HotelService,
    Generic,
    RateHelper
  ],
  imports: [
    AuthModule,
    CacheModule.register()
  ]
})
export class HotelModule {}
