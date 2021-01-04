import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DealController } from './deal.controller';
import { DealService } from './deal.service';

@Module({
  imports:[AuthModule],
  controllers: [DealController],
  providers: [DealService]
})
export class DealModule {}
