import { Module } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { IntegratorService } from './integrator.service';
import { IntegratorController } from './integrator.controller';

@Module({
  controllers: [IntegratorController],
  providers: [IntegratorService, PrismaService, PaginateService],
})
export class IntegratorModule {}
