import { Module } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { InvoiceService } from '@invoice/invoice.service';

import { AccountPlanService } from './account-plan.service';
import { AccountPlanController } from './account-plan.controller';

@Module({
  controllers: [AccountPlanController],
  providers: [
    AccountPlanService,
    PrismaService,
    PaginateService,
    InvoiceService,
  ],
})
export class AccountPlanModule {}
