import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AppVersionController } from './app-version.controller';
import { AppVersionService } from './app-version.service';

@Module({imports:[
  AuthModule
],
  controllers: [AppVersionController],
  providers: [AppVersionService]
})
export class AppVersionModule {}
