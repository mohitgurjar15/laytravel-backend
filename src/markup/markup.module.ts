import { Module } from '@nestjs/common';
import { MarkupController } from './markup.controller';
import { MarkupService } from './markup.service';
import { AuthModule } from 'src/auth/auth.module';
import { MarkupRepository } from './markup.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MarkupRepository]), AuthModule],
  controllers: [MarkupController],
  providers: [MarkupService]
})
export class MarkupModule {}
