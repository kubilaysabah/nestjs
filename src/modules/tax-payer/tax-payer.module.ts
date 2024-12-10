import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { TaxPayerService } from './tax-payer.service';
import { TaxPayerController } from './tax-payer.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [TaxPayerController],
  providers: [TaxPayerService, PrismaService, PaginateService],
})
export class TaxPayerModule {}
