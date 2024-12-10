import { HttpException, Injectable } from '@nestjs/common';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { FindAllVoucherDto } from './dto/find-all-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}
  create(createVoucherDto: CreateVoucherDto) {
    const { stoppage_code, ...model } = createVoucherDto;
    return this.prismaService.voucher.create({
      data: {
        ...model,
        stoppage_code,
      },
    });
  }

  matchInvoices({ invoice_id, tax_payer_id, type }: FindAllVoucherDto) {
    return this.prismaService.invoice.findMany({
      where: {
        id: invoice_id,
        type,
        tax_payer: {
          id: tax_payer_id,
        },
        account_plan: {
          isNot: null,
        },
        invoice_lines: {
          every: {
            account_plan: {
              isNot: null,
            },
          },
        },
      },
      include: {
        account_plan: true,
        invoice_lines: {
          include: {
            account_plan: true,
          },
        },
      },
    });
  }

  getCountByInvoiceId(invoice_id: string) {
    return this.prismaService.voucher.count({
      where: {
        invoice: {
          id: invoice_id,
        },
      },
    });
  }

  createVoucherModelFromInvoice({ invoice, tax_payer_id }): CreateVoucherDto {
    const model = {
      tax_payer_id: tax_payer_id,
      invoice_id: invoice.id,
      account_name: invoice.account_plan.account_name,
      account_code: invoice.account_plan.code,
      invoice_type: invoice.invoice_type,
      invoice_date: invoice.invoice_date,
      vat_number_or_turkish_identity_number:
        invoice.tax_number_or_turkish_identity_number,
      invoice_number: invoice.invoice_number,
      description: invoice.name,
      debt: invoice.type === 1 ? invoice.total_amount : 0,
      credit: invoice.type === 2 ? invoice.total_amount : 0,
      stoppage_code: null,
      currency: invoice.currency,
    };

    if (invoice.invoice_type === 'TEVKIFAT' && invoice.scenario !== 'HKS') {
      model.stoppage_code = invoice.stoppage_code;
    }

    return model;
  }

  createVoucherModelFromInvoiceLine({
    invoiceLine,
    invoice,
    tax_payer_id,
  }): CreateVoucherDto {
    const model = {
      tax_payer_id: tax_payer_id,
      invoice_line_id: invoiceLine.id,
      account_code: invoiceLine.account_plan.code,
      invoice_type: invoiceLine.invoice_type,
      invoice_date: invoice.invoice_date,
      description: invoiceLine.name,
      stoppage_code: invoiceLine.stoppage_code,
      account_name: invoiceLine.account_plan.account_name,
      debt: invoice.type === 1 ? invoiceLine.product_amount : 0,
      credit: invoice.type === 2 ? invoiceLine.product_amount : 0,
      currency: invoiceLine.currency,
    };

    if (invoiceLine.invoice_type === 'TEVKIFAT') {
      model.account_name = invoiceLine.name;
    }

    if (invoiceLine.name.includes('SORUMLU SIFATIYLA ÖDENECEK KDV')) {
      model.debt = invoice.type === 2 ? invoiceLine.product_amount : 0;
      model.credit = invoice.type === 1 ? invoiceLine.product_amount : 0;
    } else {
      model.debt = invoice.type === 1 ? invoiceLine.product_amount : 0;
      model.credit = invoice.type === 2 ? invoiceLine.product_amount : 0;
    }

    return model;
  }

  async createMatchingInvoices({ user, invoices, tax_payer_id }) {
    const vouchers = [];
    let credit = +user.credit;

    for await (const invoice of invoices) {
      if (credit === 0) {
        return;
      }

      const count = await this.getCountByInvoiceId(invoice.id);

      if (count > 0) {
        continue;
      }

      if (
        invoice.invoice_type === 'TEVKIFAT' ||
        invoice.invoice_type === 'HKS'
      ) {
        credit -= 10;
      } else {
        credit -= 3;
      }

      const model = this.createVoucherModelFromInvoice({
        invoice,
        tax_payer_id,
      });

      vouchers.push(model);

      for await (const invoiceLine of invoice.invoice_line) {
        const count = await this.prismaService.voucher.count({
          where: {
            invoice_line: {
              id: invoiceLine.id,
            },
          },
        });

        if (count > 0) {
          return;
        }

        const model = this.createVoucherModelFromInvoiceLine({
          invoiceLine,
          invoice,
          tax_payer_id,
        });

        vouchers.push(model);
      }
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...user,
        credit,
      },
    });

    await this.prismaService.voucher.createMany({
      data: vouchers,
      skipDuplicates: true,
    });
  }

  async findByTaxPayerId({
    invoice_id,
    tax_payer_id,
    page,
    limit,
    type,
  }: FindAllVoucherDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        tax_payers: {
          some: {
            id: tax_payer_id,
          },
        },
      },
    });

    if (+user.credit === 0) {
      throw new HttpException('Credit not found', 400);
    }

    const invoices = await this.matchInvoices({
      invoice_id,
      tax_payer_id,
      type,
    });

    await this.createMatchingInvoices({
      user,
      invoices,
      tax_payer_id,
    });

    return this.paginateService.paginate({
      model: this.prismaService.voucher,
      page,
      limit,
      where: {
        invoice: {
          id: invoice_id,
        },
        tax_payer: {
          id: tax_payer_id,
        },
      },
    });
  }

  async exportExcel(tax_payer_id: string) {
    const csvRows = [];

    const headers = [
      'Hesap Kodu',
      'Hesap Adı',
      'Tck/Vkn',
      'Belge Türü',
      'Belge Tarihi',
      'Belge No',
      'Açıklama',
      'Stok Kod',
      'Miktar',
      'KDV Oranı',
      'KDV Tutarı',
      'Tevkifat Tür Kodu',
      'Tevkifat Oranı',
      'Tevkifat Tutarı',
      'Borç',
      'Alacak',
    ];

    csvRows.push(headers.join(','));

    const vouchers = await this.prismaService.voucher.findMany({
      where: {
        invoice_line: {
          invoice: {
            tax_payer: {
              id: tax_payer_id,
            },
          },
        },
      },
    });

    vouchers.map((voucher) => {
      const row = [
        voucher.account_code,
        voucher.account_name,
        voucher.vat_number_or_turkish_identity_number,
        voucher.invoice_type,
        voucher.invoice_date,
        voucher.invoice_number,
        voucher.description,
        voucher.stock_code,
        voucher.quantity,
        voucher.vat_rate,
        voucher.vat_amount,
        voucher.stoppage_code,
        voucher.stoppage_rate,
        voucher.stoppage_amount,
        voucher.debt,
        voucher.credit,
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  }

  findOne(id: string) {
    return this.prismaService.voucher.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, updateVoucherDto: UpdateVoucherDto) {
    const { invoice_line_id, invoice_id, tax_payer_id, ...model } =
      updateVoucherDto;
    return this.prismaService.voucher.update({
      where: {
        id,
      },
      data: {
        ...model,
        tax_payer: {
          connect: {
            id: tax_payer_id,
          },
        },
        invoice: {
          connect: {
            id: invoice_id,
          },
        },
        invoice_line: {
          connect: {
            id: invoice_line_id,
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prismaService.voucher.delete({
      where: {
        id,
      },
    });
  }
}
