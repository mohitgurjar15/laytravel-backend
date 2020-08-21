import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionRepository } from './subscription.repository';
import { AuthModule } from 'src/auth/auth.module';
import { PlanRepository } from './plan.repository';
import { UserRepository } from 'src/auth/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionRepository,PlanRepository,UserRepository]), AuthModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService]
})
export class SubscriptionModule {}
