import { HttpException, Injectable } from '@nestjs/common';

export interface PaginationParams {
  orderBy?: {
    [key: string]: string;
  };
  model: any;
  page?: number;
  limit?: number;
  where?: any;
  include?: any;
  select?: { [key: string]: boolean };
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    count: number;
    page: number;
    totalPages: number;
  };
}

@Injectable()
export class PaginateService {
  async paginate<T>({
    model,
    where,
    limit,
    page,
    include,
    select,
    orderBy,
  }: PaginationParams): Promise<PaginationResult<T>> {
    const count = await model.count({
      where,
    });

    const params = {
      skip: undefined,
      take: undefined,
      where: undefined,
      select: undefined,
      include: undefined,
      orderBy: undefined,
    };

    if (page && limit) {
      params.skip = (page - 1) * limit;
      params.take = limit;
    }

    if (include) {
      params.include = include;
    }

    if (select) {
      params.select = select;
    }

    if (orderBy) {
      params.orderBy = orderBy;
    }

    if (where) {
      params.where = where;
    }

    try {
      const data = await model.findMany(params);

      return {
        data,
        meta: {
          count,
          page: page || 0,
          totalPages: limit ? Math.ceil(count / limit) : 0,
        },
      };
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
}
