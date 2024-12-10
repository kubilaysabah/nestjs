import { HttpException, Injectable } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { FindAllInvoiceDto } from './dto/find-all-invoice.dto';
import { AssignAccountPlanDto } from './dto/assign-account-plan.dto';

import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { tax_payer_id, ...model } = createInvoiceDto;

    return this.prismaService.invoice.create({
      data: {
        ...model,
        tax_payer: {
          connect: {
            id: tax_payer_id,
          },
        },
        invoice_date: createInvoiceDto.invoice_date,
        taxes: {
          createMany: {
            data: createInvoiceDto.taxes,
          },
        },
      },
      include: {
        tax_payer: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findAll({
    page,
    limit,
    tax_payer_id,
    user_id,
    ETTN,
    startDate,
    endDate,
  }: FindAllInvoiceDto) {
    return this.paginateService.paginate({
      model: this.prismaService.invoice,
      where: {
        tax_payer: {
          id: tax_payer_id,
          user: {
            id: user_id,
          },
        },
        ETTN,
        invoice_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        taxes: true,
        account_plan: true,
        tax_payer: {
          select: {
            id: true,
          },
        },
      },
      page,
      limit,
    });
  }

  findOne(id: string) {
    return this.prismaService.invoice.findUnique({
      where: {
        id,
      },
      include: {
        taxes: true,
        tax_payer: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  removeInvoiceTaxesById(id: string) {
    return this.prismaService.invoice_tax.deleteMany({
      where: {
        invoice: {
          id,
        },
      },
    });
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    return this.prismaService.invoice.update({
      where: {
        id,
      },
      data: {
        ...updateInvoiceDto,
        taxes: {
          createMany: {
            data: updateInvoiceDto.taxes,
          },
        },
      },
      include: {
        tax_payer: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async assignAccountPlan(
    id: string,
    assignAccountPlanDto: AssignAccountPlanDto,
  ) {
    const find = await this.prismaService.account_plan.findFirst({
      where: {
        id: assignAccountPlanDto.account_plan_id,
      },
      include: {
        tax_payer: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!find) {
      throw new HttpException('Account plan not found', 404);
    }

    return this.prismaService.invoice.update({
      where: {
        id,
      },
      data: {
        account_plan: {
          connect: {
            id: assignAccountPlanDto.account_plan_id,
          },
        },
      },
      include: {
        tax_payer: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prismaService.invoice.delete({
      where: {
        id,
      },
      include: {
        tax_payer: {
          select: {
            id: true,
          },
        },
      },
    });
  }
}
