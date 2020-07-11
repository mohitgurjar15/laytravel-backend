import { Module } from '@nestjs/common';
import { SupportUserController } from './support-user.controller';
import { SupportUserService } from './support-user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserRepository } from 'src/auth/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), AuthModule],
  controllers: [SupportUserController],
  providers: [SupportUserService]
})
export class SupportUserModule {}
