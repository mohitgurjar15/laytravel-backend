import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyRepository } from './currency.repository';

@Module({
  imports:[
    TypeOrmModule.forFeature([CurrencyRepository]),
    AuthModule
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService]
})
export class CurrencyModule {}
