import { Module } from '@nestjs/common';
import { PaymentConfigurationController } from './payment-configuration.controller';
import { PaymentConfigurationService } from './payment-configuration.service';

@Module({
  controllers: [PaymentConfigurationController],
  providers: [PaymentConfigurationService]
})
export class PaymentConfigurationModule {}
