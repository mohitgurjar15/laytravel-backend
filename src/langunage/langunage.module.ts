import { Module } from '@nestjs/common';
import { LangunageController } from './langunage.controller';
import { LangunageService } from './langunage.service';

@Module({
  controllers: [LangunageController],
  providers: [LangunageService]
})
export class LangunageModule {}
