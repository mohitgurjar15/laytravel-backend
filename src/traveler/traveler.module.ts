import { Module } from '@nestjs/common';
import { TravelerController } from './traveler.controller';
import { TravelerService } from './traveler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';
const jwtConfig = config.get('jwt');

@Module({
  imports:[
    TypeOrmModule.forFeature([UserRepository]),
    AuthModule,
    JwtModule.register({
      secret: jwtConfig.SecretKey,
      signOptions:{
        expiresIn:jwtConfig.ExpireIn
      }
    }),
  ],
  controllers: [TravelerController],
  providers: [TravelerService]
})
export class TravelerModule {}
