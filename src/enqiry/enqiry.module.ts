import { Module } from '@nestjs/common';
import { EnqiryController } from './enqiry.controller';
import { EnqiryService } from './enqiry.service';
import { AuthModule } from 'src/auth/auth.module';
import { EnquiryRepository } from './enquiry.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([EnquiryRepository]), AuthModule],
  controllers: [EnqiryController],
  providers: [EnqiryService]
})
export class EnqiryModule {}
