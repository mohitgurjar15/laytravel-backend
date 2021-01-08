import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GeneralController } from './general.controller';
import { GeneralService } from './general.service';

@Module({
  imports:[
    AuthModule
  ],
  controllers: [GeneralController],
  providers: [GeneralService]
})
export class GeneralModule {}
