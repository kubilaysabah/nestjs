import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';
import { InvoiceLineService } from './invoice-line.service';
import { InvoiceLineController } from './invoice-line.controller';

@Module({
  controllers: [InvoiceLineController],
  providers: [InvoiceLineService, PrismaService, PaginateService],
})
export class InvoiceLineModule {}
