import { Module } from '@nestjs/common';
import { NewsLettersController } from './news-letters.controller';
import { NewsLettersService } from './news-letters.service';
import { AuthModule } from 'src/auth/auth.module';
import { NewsLettersRepository } from './news-letters.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ TypeOrmModule.forFeature([NewsLettersRepository]),AuthModule],
  controllers: [NewsLettersController],
  providers: [NewsLettersService]
})
export class NewsLettersModule {}
