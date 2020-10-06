import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PredictionFactorMarkupController } from './prediction-factor-markup.controller';
import { PredictionFactorMarkupRepository } from './prediction-factor-markup.repository';
import { PredictionFactorMarkupService } from './prediction-factor-markup.service';

@Module({
  imports: [TypeOrmModule.forFeature([PredictionFactorMarkupRepository]), AuthModule],
  controllers: [PredictionFactorMarkupController],
  providers: [PredictionFactorMarkupService]
})
export class PredictionFactorMarkupModule {}
