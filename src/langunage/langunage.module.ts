import { Module } from '@nestjs/common';
import { LangunageController } from './langunage.controller';
import { LangunageService } from './langunage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageRepository } from './language.repository';

@Module({
  imports : [TypeOrmModule.forFeature([LanguageRepository])],
  controllers: [LangunageController],
  providers: [LangunageService]
})
export class LangunageModule {}
