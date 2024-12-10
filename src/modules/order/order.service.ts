import { Injectable, HttpException } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  async create(user_id: string, createOrderDto: CreateOrderDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return this.prismaService.user.update({
      where: {
        id: user_id,
      },
      data: {
        ...user,
        credit: createOrderDto.credit,
      },
    });
  }
}
