import { Module } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { SoapService } from '@services/soap.service';
import { PaginateService } from '@services/paginate.service';

import { UyumsoftController } from './uyumsoft.controller';
import { UyumSoftService } from './uyumsoft.service';

@Module({
  imports: [],
  controllers: [UyumsoftController],
  providers: [UyumSoftService, PrismaService, SoapService, PaginateService],
})
export class UyumsoftModule {}
