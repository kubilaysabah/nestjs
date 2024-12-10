import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';
import { TaxPayerModule } from '@tax-payer/tax-payer.module';
import { VoucherModule } from '@voucher/voucher.module';
import { IntegratorModule } from '@integrator/integrator.module';
import { InvoiceModule } from '@invoice/invoice.module';
import { InvoiceLineModule } from '@invoice-line/invoice-line.module';
import { UtilsModule } from '@utils/utils.module';
import { AccountPlanModule } from '@account-plan/account-plan.module';
import { IntegrationsModule } from '@integrations/integrations.module';
import { PaymentModule } from '@payment/payment.module';
import { OrderModule } from '@order/order.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TaxPayerModule,
    VoucherModule,
    IntegratorModule,
    InvoiceModule,
    InvoiceLineModule,
    UtilsModule,
    AccountPlanModule,
    IntegrationsModule,
    PaymentModule,
    OrderModule,
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
