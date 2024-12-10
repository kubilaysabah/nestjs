import { Injectable } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';
import { CreateIntegratorDto } from './dto/create-integrator.dto';
import { UpdateIntegratorDto } from './dto/update-integrator.dto';

@Injectable()
export class IntegratorService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  create(createIntegratorDto: CreateIntegratorDto[]) {
    return this.prismaService.integrator.createMany({
      data: createIntegratorDto,
      skipDuplicates: true,
    });
  }

  async findAll({ page, limit }: { page?: number; limit?: number }) {
    return this.paginateService.paginate({
      orderBy: {
        integration_code: 'asc',
      },
      model: this.prismaService.integrator,
      limit,
      page,
    });
  }

  findOne(id: string) {
    return this.prismaService.integrator.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, updateIntegratorDto: UpdateIntegratorDto) {
    return this.prismaService.integrator.update({
      where: {
        id,
      },
      data: updateIntegratorDto,
    });
  }

  remove(id: string) {
    return this.prismaService.integrator.delete({
      where: {
        id,
      },
    });
  }
}
