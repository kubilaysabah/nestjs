import { Injectable } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class UtilsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  createActivities(createActivityDto: CreateActivityDto[]) {
    return this.prismaService.activity.createMany({
      data: createActivityDto,
      skipDuplicates: true,
    });
  }

  async activities({ page, limit }: { page: number; limit: number }) {
    return this.paginateService.paginate({
      model: this.prismaService.activity,
      page,
      limit,
    });
  }
}
