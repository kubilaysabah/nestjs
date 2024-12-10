import { HttpException, Injectable } from '@nestjs/common';
import { PaginateService } from '@services/paginate.service';

import { CreateInvoiceLineDto } from './dto/create-invoice-line.dto';
import { UpdateInvoiceLineDto } from './dto/update-invoice-line.dto';
import { AssignAccountPlanDto } from './dto/assign-account-plan.dto';

import { PrismaService } from '@/shared/services/prisma.service';

@Injectable()
export class InvoiceLineService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  create(createInvoiceLineDto: CreateInvoiceLineDto) {
    return this.prismaService.invoice_line.create({
      data: {
        ...createInvoiceLineDto,
        invoice_id: createInvoiceLineDto.invoice_id,
        taxes: {
          createMany: {
            data: createInvoiceLineDto.taxes,
            skipDuplicates: true,
          },
        },
      },
      include: {
        invoice: {
          include: {
            tax_payer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll({
    page,
    limit,
    invoice_id,
    tax_payer_id,
  }: {
    page?: number;
    limit?: number;
    invoice_id?: string;
    tax_payer_id?: string;
  }) {
    return this.paginateService.paginate({
      model: this.prismaService.invoice_line,
      where: {
        invoice: {
          id: invoice_id,
          tax_payer: {
            id: tax_payer_id,
          },
        },
      },
      include: {
        taxes: true,
        account_plan: true,
        invoice: {
          include: {
            tax_payer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      page,
      limit,
    });
  }

  findOne(id: string) {
    return this.prismaService.invoice_line.findUnique({
      where: {
        id,
      },
      include: {
        taxes: true,
        invoice: {
          include: {
            tax_payer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }

  async assignAccountCode(
    id: string,
    assignAccountPlanDto: AssignAccountPlanDto,
  ) {
    const find = await this.prismaService.account_plan.findFirst({
      where: {
        id: assignAccountPlanDto.account_plan_id,
      },
    });

    if (!find) {
      throw new HttpException('Account code not found', 404);
    }

    return this.prismaService.invoice_line.update({
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
        invoice: {
          include: {
            tax_payer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateInvoiceLineDto: UpdateInvoiceLineDto) {
    await this.prismaService.invoice_line_tax.deleteMany({
      where: {
        invoice_line: {
          id,
        },
      },
    });

    return this.prismaService.invoice_line.update({
      where: {
        id,
      },
      data: {
        name: updateInvoiceLineDto.name,
        unit_amount: updateInvoiceLineDto.unit_amount,
        quantity: updateInvoiceLineDto.quantity,
        product_code: updateInvoiceLineDto.product_code,
        product_amount: updateInvoiceLineDto.product_amount,
        unit: updateInvoiceLineDto.unit,
        account_code: updateInvoiceLineDto.account_code,
        invoice_type: updateInvoiceLineDto.invoice_type,
        currency: updateInvoiceLineDto.currency,
        taxes: {
          createMany: {
            data: updateInvoiceLineDto.taxes,
            skipDuplicates: true,
          },
        },
      },
      include: {
        invoice: {
          include: {
            tax_payer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prismaService.invoice_line.delete({
      where: {
        id,
      },
      include: {
        invoice: {
          include: {
            tax_payer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }
}
