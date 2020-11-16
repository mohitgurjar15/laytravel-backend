/*
 * Created on Tue May 12 2020
 *
 * @Auther:- Parth Virani
 * Copyright (c) 2020 Oneclick
 * my variables are ${myvar1} and ${myvar2}
 */

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthController } from './auth.controller';
import { JwtModule} from '@nestjs/jwt';
import { PassportModule} from '@nestjs/passport'
import * as config from 'config';
import { JwtStrategy } from './jwt.strategy';
import { ForgetPassWordRepository } from './forget-password.repository';


const jwtConfig = config.get('jwt');

@Module({
  imports: [PassportModule.register({
    defaultStrategy:'jwt'
  }),
  JwtModule.register({
    secret: jwtConfig.SecretKey,
    signOptions:{
      expiresIn:jwtConfig.ExpireIn
    }
  }),
    TypeOrmModule.forFeature([UserRepository,ForgetPassWordRepository]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy
  ],
  exports:[
    JwtStrategy,
    PassportModule,
  ]
})
export class AuthModule {}
