import { Module } from '@nestjs/common';
import { RewordPointController } from './reword-point.controller';
import { RewordPointService } from './reword-point.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewordPointEarnRepository } from './reword-point-earn.repository';
import { RewordPointRedeemRepository } from './roword-point-redeem.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([RewordPointEarnRepository,RewordPointRedeemRepository]), AuthModule],
  controllers: [RewordPointController],
  providers: [RewordPointService]
})
export class RewordPointModule {}
