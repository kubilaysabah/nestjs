import { HttpException, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { CreateTaxPayerDto } from './dto/create-tax-payer.dto';
import { UpdateTaxPayerDto } from './dto/update-tax-payer.dto';

@Injectable()
export class TaxPayerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  async create({
    user_id,
    createTaxPayerDto,
  }: {
    user_id: string;
    createTaxPayerDto: CreateTaxPayerDto;
  }) {
    const { activity_id, integrator_id, ...model } = createTaxPayerDto;

    const user = await this.prismaService.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (integrator_id) {
      const integrator = await this.prismaService.integrator.findUnique({
        where: {
          id: integrator_id,
        },
      });

      if (!integrator) {
        throw new HttpException('Integrator not found', 404);
      }
    }

    return this.prismaService.tax_payer.create({
      data: {
        ...model,
        activity_id,
        integrator_id,
        user_id,
      },
    });
  }

  async findAll({
    user_id,
    integrator_id,
    page,
    limit,
  }: {
    user_id: string;
    integrator_id?: string;
    page: number;
    limit: number;
  }) {
    return this.paginateService.paginate({
      limit,
      page,
      model: this.prismaService.tax_payer,
      where: {
        user: {
          id: user_id,
        },
        integrator: {
          id: integrator_id,
        },
      },
      include: {
        activity: true,
        integrator: true,
      },
    });
  }

  findOne(id: string) {
    return this.prismaService.tax_payer.findUnique({
      where: {
        id,
      },
      include: {
        activity: true,
        integrator: true,
      },
    });
  }

  update({
    id,
    updateTaxPayerDto,
    user_id,
  }: {
    id: string;
    user_id: string;
    updateTaxPayerDto: UpdateTaxPayerDto;
  }) {
    const { activity_id, integrator_id, ...model } = updateTaxPayerDto;
    return this.prismaService.tax_payer.update({
      where: {
        id,
      },
      data: {
        ...model,
        activity: {
          connect: {
            id: activity_id,
          },
        },
        user: {
          connect: {
            id: user_id,
          },
        },
        integrator: {
          connect: {
            id: integrator_id,
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prismaService.tax_payer.delete({
      where: {
        id,
      },
    });
  }

  @Cron('0 0 8 * * *')
  async matchInvoices(id: string) {
    const invoiceCount = await this.prismaService.invoice.count({
      where: {
        tax_payer: {
          id,
        },
      },
    });

    if (invoiceCount === 0) {
      throw new HttpException('Invoice is not found', 400);
    }

    const accountPlanCount = await this.prismaService.account_plan.count({
      where: {
        tax_payer: {
          id: id,
        },
      },
    });

    if (accountPlanCount === 0) {
      throw new HttpException('Account plan is not found', 400);
    }

    try {
      await this.prismaService.$queryRaw`
          UPDATE invoice
          SET account_plan_id = (
              SELECT ap.id
              FROM account_plan ap
              WHERE (
                        (invoice.name = ap.account_name OR invoice.tax_number_or_turkish_identity_number = ap.turkish_identity_number_or_tax_number)
                            AND invoice.tax_payer_id = ${id}
                            AND (
                              CASE
                                  WHEN invoice.type = 1 THEN (ap.code LIKE '329%' OR ap.code LIKE '320%')
                                  WHEN invoice.type = 2 THEN ap.code LIKE '120%'
                              END
                            )
                        )
              LIMIT 1
              )
          WHERE EXISTS (
              SELECT 1
              FROM account_plan ap
              WHERE (
                (invoice.name = ap.account_name OR invoice.tax_number_or_turkish_identity_number = ap.turkish_identity_number_or_tax_number)
                AND invoice.tax_payer_id = ${id}
                AND (
                  CASE
                    WHEN invoice.type = 1 THEN (ap.code LIKE '329%' OR ap.code LIKE '320%')
                    WHEN invoice.type = 2 THEN ap.code LIKE '120%'
                  END
                )
              )
        )
      `;

      return {
        message: 'Matching completed successfully',
      };
    } catch (e) {
      console.error(e);
      throw new HttpException('An error occurred during matching', 500);
    }
  }

  @Cron('0 0 8 * * *')
  async matchInvoiceLines(id: string) {
    const invoiceLineCount = await this.prismaService.invoice_line.count({
      where: {
        invoice: {
          tax_payer: {
            id,
          },
        },
      },
    });

    if (invoiceLineCount === 0) {
      throw new HttpException('InvoiceLine is not found', 400);
    }

    const accountPlanCount = await this.prismaService.account_plan.count({
      where: {
        tax_payer: {
          id: id,
        },
      },
    });

    if (accountPlanCount === 0) {
      throw new HttpException('Account Plan is not found', 400);
    }

    try {
      await this.prismaService.$queryRaw`
          UPDATE invoice_line
          SET account_plan_id = (
              SELECT ap.id FROM account_plan ap
                                    JOIN invoice i ON i.id = invoice_line.invoice_id
                                    JOIN tax_payer tp ON tp.id = i.tax_payer_id
              WHERE tp.id = ${id}
                AND (
                  CASE
                      WHEN
                          i.type = 1
                              AND i.invoice_type = 'IADE'
                              AND i.scenario != 'HKS'
                              AND invoice_line.name LIKE '%KDV%'
                              AND ap.account_name LIKE '%İLAVE EDİLECEK%'
                              AND ap.account_name LIKE CONCAT('%', i.vat_rate, '%')
                              AND ap.code LIKE '191%'
                      THEN 
                        ap.code
              WHEN 
                  i.type = 1 
                      AND i.invoice_type = 'SATIS' 
                      AND i.scenario != 'HKS' 
                      AND invoice_line.name LIKE '%KDV%'
                      AND ap.account_name LIKE '%İNDİRİLECEK%' 
                      AND ap.account_name LIKE CONCAT('%', i.vat_rate, '%')
                      AND ap.code LIKE '191%'
                  THEN 
                      ap.code
              WHEN 
                  i.type = 1 
                      AND i.invoice_type = 'TEVKIFAT' 
                      AND i.scenario != 'HKS' 
                      AND invoice_line.name LIKE '%KDV%' 
                      AND (ap.account_name LIKE '%İNDİRİLECEK%' OR ap.account_name LIKE '%SORUMLU%')
                      AND ap.code LIKE '191%' 
                  THEN 
                      ap.code 
              WHEN 
                  i.type = 1 
                        AND i.invoice_type = 'SATIS' AND i.scenario != 'HKS'
                        AND invoice_line.name NOT LIKE '%KDV%'
                        AND ap.account_name LIKE ap.code LIKE '153%'
                        AND ap.account_name LIKE CONCAT('%', invoice_line.name, '%')
                  THEN 
                      ap.account_name
              WHEN 
                  i.type = 2 
                      AND i.invoice_type = 'SATIS' 
                      AND i.scenario != 'HKS' 
                      AND invoice_line.name LIKE '%KDV%' 
                      AND ap.account_name LIKE '%HESAPLANAN%'
                      AND ap.account_name LIKE CONCAT('%', invoice_line.name, '%')
                      AND ap.code LIKE '391%'
                  THEN 
                      ap.code
            WHEN
                i.type = 1
                    AND ap.code LIKE '153%' THEN ap.code
            WHEN
                i.type = 2
                    AND ap.code LIKE '600%' THEN ap.code
                ElSE
                    ap.account_name LIKE CONCAT('%', invoice_line.name, '%')
          END
        )
    LIMIT 1
  )
          WHERE EXISTS (
              SELECT 1 FROM invoice i JOIN tax_payer tp ON tp.id = i.tax_payer_id JOIN account_plan ap ON ap.tax_payer_id = tp.id WHERE i.id = invoice_line.invoice_id
            AND tp.id = ${id}
            AND (
                CASE
                    WHEN
                      i.type = 1
                      AND i.invoice_type = 'IADE'
                      AND i.scenario != 'HKS'
                      AND invoice_line.name LIKE '%KDV%'
                      AND ap.account_name LIKE '%İLAVE EDİLECEK%'
                      AND ap.account_name LIKE CONCAT('%', i.vat_rate, '%')
                      AND ap.code LIKE '191%'
                    THEN
                      ap.code
                    WHEN
                      i.type = 1
                      AND i.invoice_type = 'SATIS'
                      AND i.scenario != 'HKS'
                      AND invoice_line.name LIKE '%KDV%'
                      AND ap.account_name LIKE '%İNDİRİLECEK%'
                      AND ap.account_name LIKE CONCAT('%', i.vat_rate, '%')
                      AND ap.code LIKE '191%'
                    THEN
                      ap.code
                    WHEN
                      i.type = 1
                      AND i.invoice_type = 'TEVKIFAT'
                      AND i.scenario != 'HKS'
                      AND invoice_line.name LIKE '%KDV%'
                      AND (ap.account_name LIKE '%İNDİRİLECEK%' OR ap.account_name LIKE '%SORUMLU%')
                      AND ap.code LIKE '191%'
                    THEN
                      ap.code
                    WHEN
                      i.type = 1
                      AND i.invoice_type = 'SATIS' AND i.scenario != 'HKS'
                      AND invoice_line.name NOT LIKE '%KDV%'
                      AND ap.account_name LIKE ap.code LIKE '153%'
                      AND ap.account_name LIKE CONCAT('%', invoice_line.name, '%')
                    THEN
                      ap.account_name
                    WHEN
                        i.type = 2
                          AND i.invoice_type = 'SATIS'
                          AND i.scenario != 'HKS'
                          AND invoice_line.name LIKE '%KDV%'
                          AND ap.account_name LIKE '%HESAPLANAN%'
                          AND ap.account_name LIKE CONCAT('%', i.vat_rate, '%')
                          AND ap.code LIKE '391%'
                    THEN
                      ap.code
                  WHEN
                    i.type = 1
                        AND ap.account_name LIKE CONCAT('%', invoice_line.name, '%')
                        AND ap.code LIKE '153%' THEN ap.code
                    WHEN
                        i.type = 2
                            AND ap.account_name LIKE CONCAT('%', invoice_line.name, '%')
                            AND ap.code LIKE '600%' THEN ap.code
                ElSE
                    ap.account_name LIKE CONCAT('%', invoice_line.name, '%')
                END
              )
        );
      `;

      return {
        message: 'Matching completed successfully',
      };
    } catch (e) {
      console.error(e);
      throw new HttpException('An error occurred during matching', 500);
    }
  }
}
