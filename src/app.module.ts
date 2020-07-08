import { Module } from '@nestjs/common';
import { typeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import * as config from 'config';
import {  MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { FlightModule } from './flight/flight.module';
import { AdminModule } from './admin/admin.module';

const mailConfig = config.get('email');

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UserModule,
    MailerModule.forRoot({
      transport: {
        host: mailConfig.host,
        port: mailConfig.port,
        ignoreTLS: true,
        secure: mailConfig.secure,
        auth: {
          user: mailConfig.user,
          pass: mailConfig.pass,
        },
      },
      defaults: {
        from: config.user,
      },
      preview: false,
      template: {
        dir: 'src/config/email_template',
        adapter: new HandlebarsAdapter(), 
        options: {
          strict: true,
        },
      },
    }),
    FlightModule,
    AdminModule,
  ],
 
})
export class AppModule {}
