import { Module } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { UtilsService } from './utils.service';
import { UtilsController } from './utils.controller';

@Module({
  controllers: [UtilsController],
  providers: [UtilsService, PrismaService, PaginateService],
})
export class UtilsModule {}
