import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PreductionFactorMarkup } from 'src/entity/preduction-factor-markup.entity';
import { PreductionFactorMarkupController } from './preduction-factor-markup.controller';
import { PreductionFactorMarkupRepository } from './preduction-factor-markup.repository';
import { PreductionFactorMarkupService } from './preduction-factor-markup.service';

@Module({
  imports: [TypeOrmModule.forFeature([PreductionFactorMarkupRepository]), AuthModule],
  controllers: [PreductionFactorMarkupController],
  providers: [PreductionFactorMarkupService]
})
export class PreductionFactorMarkupModule {}
