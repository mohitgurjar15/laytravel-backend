import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentConfigurationController } from './payment-configuration.controller';
import { PaymentConfigurationService } from './payment-configuration.service';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [PaymentConfigurationController],
  providers: [PaymentConfigurationService]
})
export class PaymentConfigurationModule {}
