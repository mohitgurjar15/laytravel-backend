import { Module } from '@nestjs/common';
import { NewsLettersController } from './news-letters.controller';
import { NewsLettersService } from './news-letters.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ AuthModule],
  controllers: [NewsLettersController],
  providers: [NewsLettersService]
})
export class NewsLettersModule {}
