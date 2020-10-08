import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { FaqCategoryController } from './faq-category.controller';
import { FaqCategoryRepository } from './faq-category.repository';
import { FaqCategoryService } from './faq-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([FaqCategoryRepository]), AuthModule],
  controllers: [FaqCategoryController],
  providers: [FaqCategoryService]
})
export class FaqCategoryModule {}
