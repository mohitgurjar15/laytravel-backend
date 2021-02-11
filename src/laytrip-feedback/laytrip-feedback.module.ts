import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { LaytripFeedbackController } from './laytrip-feedback.controller';
import { LaytripFeedbackRepository } from './laytrip-feedback.repository';
import { LaytripFeedbackService } from './laytrip-feedback.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([LaytripFeedbackRepository]),
        AuthModule
    ],
    controllers: [
        LaytripFeedbackController
    ],
    providers: [
        LaytripFeedbackService
    ],
})
export class LaytripFeedbackModule { }
