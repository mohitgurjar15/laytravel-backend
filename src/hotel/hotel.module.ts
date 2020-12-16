import { CacheModule, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';

@Module({
  controllers: [HotelController],
  providers: [HotelService],
  imports: [
    AuthModule,
    CacheModule.register()
  ]
})
export class HotelModule {}
