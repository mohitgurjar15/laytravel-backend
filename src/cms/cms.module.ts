import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsRepository } from './cms.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([CmsRepository]),
  AuthModule],
  controllers: [CmsController],
  providers: [CmsService]
})
export class CmsModule {}
