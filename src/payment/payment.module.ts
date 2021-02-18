import { CacheModule, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AuthModule } from 'src/auth/auth.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    AuthModule,
    // CacheModule.register(),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),

  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule { }
