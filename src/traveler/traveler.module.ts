import { Module } from '@nestjs/common';
import { TravelerController } from './traveler.controller';
import { TravelerService } from './traveler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([UserRepository]),
    AuthModule
  ],
  controllers: [TravelerController],
  providers: [TravelerService]
})
export class TravelerModule {}
