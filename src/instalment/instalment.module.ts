import { Module } from '@nestjs/common';
import { InstalmentController } from './instalment.controller';
import { InstalmentService } from './instalment.service';

@Module({
  controllers: [InstalmentController],
  providers: [InstalmentService]
})
export class InstalmentModule {}
