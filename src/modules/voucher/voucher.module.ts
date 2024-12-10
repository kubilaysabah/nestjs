import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';

@Module({
  controllers: [VoucherController],
  providers: [VoucherService, PrismaService, PaginateService],
})
export class VoucherModule {}
