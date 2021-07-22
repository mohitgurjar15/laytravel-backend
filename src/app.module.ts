import { LaytripFeedbackModule } from "./laytrip-feedback/laytrip-feedback.module";
import { VacationRentalModule } from "./vacation-rental/vacation-rental.module";
import {
    HttpModule,
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from "@nestjs/common";
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
import { I18nModule, I18nJsonParser, QueryResolver } from "nestjs-i18n";
import * as path from "path";
import { GeneralModule } from "./general/general.module";
import { SupplierModule } from "./supplier/supplier.module";
import { SupportUserModule } from "./support-user/support-user.module";
import { LangunageModule } from "./langunage/langunage.module";
import { CurrencyModule } from "./currency/currency.module";
import { HotelModule } from "./hotel/hotel.module";
import { InstalmentModule } from "./instalment/instalment.module";
import { ModulesModule } from "./modules/modules.module";
import { MarkupModule } from "./markup/markup.module";
import { ActivitiesModule } from "./activities/activities.module";
import { FaqModule } from "./faq/faq.module";
import { EnqiryModule } from "./enqiry/enqiry.module";
import { CmsModule } from "./cms/cms.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { RewordPointModule } from "./reword-point/reword-point.module";
import { CronJobsModule } from "./cron-jobs/cron-jobs.module";
import { TravelerModule } from "./traveler/traveler.module";
import { PaymentModule } from "./payment/payment.module";
import { BookingModule } from "./booking/booking.module";
import { AdminDashboardModule } from "./admin-dashboard/admin-dashboard.module";
import { NewsLettersModule } from "./news-letters/news-letters.module";
import { BookingFeedbackModule } from "./booking-feedback/booking-feedback.module";
import { PredictionFactorMarkupModule } from "./prediction-factor-markup/prediction-factor-markup.module";
import { FaqCategoryModule } from "./faq-category/faq-category.module";
import { AppVersionModule } from "./app-version/app-version.module";
import { MarketingModule } from "./marketing/marketing.module";
import { CartModule } from "./cart/cart.module";
import { DealModule } from "./deal/deal.module";
import { LaytripCategoryModule } from "./laytrip-category/laytrip-category.module";
import { FlightRouteModule } from "./flight-route/flight-route.module";
import { LandingPageModule } from "./landing-page/landing-page.module";
import { AppController } from "./app/app.controller";
import { AppLoggerMiddleware } from "./http-interceptor";
import { PaymentConfigurationModule } from './payment-configuration/payment-configuration.module';
console.log(typeOrmConfig);

@Module({
    imports: [
        TypeOrmModule.forRoot(typeOrmConfig),
        AuthModule,
        UserModule,
        MailerModule.forRoot({
            transport: {
                maxConnections: 3,
                pull: true,
                host: mailConfig.host,
                port: mailConfig.port,
                secure: mailConfig.secure,
                service: "Outlook365",
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
                dir: "src/config/email_template",
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
        FlightModule,
        VacationRentalModule,
        AdminModule,
        I18nModule.forRoot({
            fallbackLanguage: "en",
            parser: I18nJsonParser,
            parserOptions: {
                path: path.join(__dirname, "/i18n/"),
                watch: true,
            },
            resolvers: [
                { use: QueryResolver, options: ["lang", "locale", "l"] },
            ],
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
        TravelerModule,
        PaymentModule,
        BookingModule,
        AdminDashboardModule,
        NewsLettersModule,
        BookingFeedbackModule,
        LaytripFeedbackModule,
        PredictionFactorMarkupModule,
        FaqCategoryModule,
        AppVersionModule,
        MarketingModule,
        CartModule,
        DealModule,
        LaytripCategoryModule,
        FlightRouteModule,
        LandingPageModule,
        PaymentConfigurationModule,
        /* CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }), */
    ],
    controllers: [AppController],
    /* providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    }
  ],*/
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        // consumer.apply(AppLoggerMiddleware).forRoutes("*");
    }
}
