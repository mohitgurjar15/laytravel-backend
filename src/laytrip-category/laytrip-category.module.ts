import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { LaytripCategoryController } from './laytrip-category.controller';
import { LaytripCategoryService } from './laytrip-category.service';

@Module({
  imports: [AuthModule],
  controllers: [LaytripCategoryController],
  providers: [LaytripCategoryService]
})
export class LaytripCategoryModule {}
