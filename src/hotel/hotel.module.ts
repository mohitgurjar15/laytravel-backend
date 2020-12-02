import { CacheModule, Module } from '@nestjs/common';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';

@Module({
  controllers: [HotelController],
  providers: [HotelService],
  imports: [
    CacheModule.register()
  ]
})
export class HotelModule {}
