import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    AuthModule
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService]
})
export class AdminDashboardModule {}
