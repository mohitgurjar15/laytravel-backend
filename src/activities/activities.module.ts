import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { AuthModule } from 'src/auth/auth.module';
import { ActivitylogRepository } from './activities.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginLogRepository } from './loginlog.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ActivitylogRepository,LoginLogRepository]), AuthModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService]
})
export class ActivitiesModule {}
