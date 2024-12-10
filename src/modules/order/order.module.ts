import { Module } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService, PaginateService],
})
export class OrderModule {}
