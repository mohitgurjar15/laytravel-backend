import { Module, CacheModule, CacheInterceptor } from "@nestjs/common";
import { typeOrmConfig } from "./config/typeorm.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import * as config from "config";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { FlightModule } from "./flight/flight.module";
import { AdminModule } from "./admin/admin.module";
const mailConfig = config.get("email");
import {
	I18nModule,
	I18nJsonParser,
	QueryResolver,
	HeaderResolver,
} from "nestjs-i18n";
import * as path from "path";
import * as redisStore from "cache-manager-redis-store";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { GeneralModule } from "./general/general.module";
import { SupplierModule } from "./supplier/supplier.module";
import { SupportUserModule } from "./support-user/support-user.module";
import { LangunageModule } from './langunage/langunage.module';
import { CurrencyModule } from './currency/currency.module';
import { HotelModule } from './hotel/hotel.module';
import { InstalmentModule } from './instalment/instalment.module';
import { ModulesModule } from './modules/modules.module';
import { MarkupModule } from './markup/markup.module';
import { ActivitiesModule } from './activities/activities.module';
import { FaqModule } from './faq/faq.module';
import { EnqiryModule } from './enqiry/enqiry.module';
import { CmsModule } from "./cms/cms.module";
import { SubscriptionModule } from './subscription/subscription.module';
import { RewordPointModule } from './reword-point/reword-point.module';
import { CronJobsModule } from './cron-jobs/cron-jobs.module';
<<<<<<< HEAD
import { TravelerModule } from './traveler/traveler.module';
=======
import { PaymentModule } from './payment/payment.module';
>>>>>>> 204ce12f960fbc8d2171bba935650508467ce505


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
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale', 'l'] }
      ]
    }),
    GeneralModule,
    SupplierModule,
		SupportUserModule,
		LangunageModule,
		CurrencyModule,
		HotelModule,
		InstalmentModule,
		ModulesModule,
		MarkupModule,
		ActivitiesModule,
		FaqModule,
		EnqiryModule,
		CmsModule,
		SubscriptionModule,
		RewordPointModule,
		CronJobsModule,
<<<<<<< HEAD
		TravelerModule,
=======
		PaymentModule,
>>>>>>> 204ce12f960fbc8d2171bba935650508467ce505
    /* CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }), */
	],
	/* providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    }
  ],*/
})
export class AppModule {}
