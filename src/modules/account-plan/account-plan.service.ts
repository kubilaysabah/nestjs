import { HttpException, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { CreateAccountCodeDto } from './dto/create-account-code.dto';
import { UpdateAccountCodeDto } from './dto/update-account-code.dto';

@Injectable()
export class AccountPlanService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  async upload(file: Express.Multer.File, tax_payer_id: string) {
    const taxPayer = await this.prismaService.tax_payer.findUnique({
      where: {
        id: tax_payer_id,
      },
    });

    if (!taxPayer) {
      throw new HttpException('Tax payer not found', 404);
    }

    const find = await this.prismaService.account_plan.count({
      where: {
        tax_payer: {
          id: tax_payer_id,
        },
      },
    });

    if (find > 0) {
      await this.prismaService.account_plan.deleteMany({
        where: {
          tax_payer: {
            id: tax_payer_id,
          },
        },
      });
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    try {
      await this.prismaService.account_plan.createMany({
        data: data.map((row) => ({
          account_plan_id: row.ID,
          code: row.KOD,
          account_name: row.HESAP_ADI,
          account_character: row.HESAP_KARAKTER,
          account_level: row.HESAP_SEVIYE,
          debt_amount: row.BORC_TUTARI,
          credit_amount: row.ALACAK_TUTARI,
          debt_quantity: row.BORC_MIKTARI,
          credit_quantity: row.ALACAK_MIKTARI,
          vat_rate: row.KDV_ORANI,
          unit: row.BIRIM,
          stock_code: row.STOK_KODU,
          turkish_identity_number_or_tax_number: row.TCK_VKN,
          special_code_1: row.OZEL_KOD_1,
          special_code_2: row.OZEL_KOD_2,
          currency: row.DOVIZ_CINSI,
          is_have_sub_account: row.ALT_HESABI_VAR === 1,
          account_name_2: row.HESAP_ADI_2,
          address_number: row.ADRES_NO,
          exchange: row.KUR_CINSI,
          use_exchange_difference: row.KF_KULLAN === 1,
          exchange_difference: row.KUR_CINSI,
          exchange_difference_type: row.KF_KUR_CINSI,
          exchange_difference_a_account_code: row.KF_A_HESAP_KODU,
          exchange_difference_b_account_code: row.KF_B_HESAP_KODU,
          vat_account_code: row.KDV_HESAP_KODU,
          stoppage_type_code: row.TVK_TUR_KODU,
          stoppage_rate_1: row.TVK_ORANI_1,
          stoppage_rate_2: row.TVK_ORANI_2,
          functioning_code: row.FAAL_KODU,
          debt_foreign_currency: row.BORC_DOVIZ_TUTARI,
          credit_foreign_currency: row.ALACAK_DOVIZ_TUTARI,
          version: row.VERSIYON.toString(),
          createdAt: dayjs(row.EKLEME_TARIHI).toISOString(),
          updatable: row.DEGISTIRILEBILIR === 1,
          tax_payer_id: taxPayer.id,
        })),
        skipDuplicates: true,
      });

      return {
        message: 'Account plan uploaded successfully',
      };
    } catch (e) {
      console.error('There was an error uploading the account plan', e);
      throw new HttpException(
        'There was an error uploading the account plan',
        400,
      );
    }
  }

  async findByTaxPayerId({
    tax_payer_id,
    page,
    limit,
  }: {
    tax_payer_id?: string;
    page?: number;
    limit?: number;
  }) {
    if (!tax_payer_id) {
      throw new HttpException('Tax payer id is required', 400);
    }

    const taxPayer = await this.prismaService.tax_payer.findUnique({
      where: {
        id: tax_payer_id,
      },
    });

    if (!taxPayer) {
      throw new HttpException('Tax payer not found', 404);
    }

    return this.paginateService.paginate({
      model: this.prismaService.account_plan,
      page,
      limit,
      where: {
        tax_payer: {
          id: tax_payer_id,
        },
      },
    });
  }

  async findAccountCodesByTaxPayerId(tax_payer_id?: string) {
    if (!tax_payer_id) {
      throw new HttpException('Tax payer id is required', 400);
    }

    const taxPayer = await this.prismaService.tax_payer.findUnique({
      where: {
        id: tax_payer_id,
      },
    });

    if (!taxPayer) {
      throw new HttpException('Tax payer not found', 404);
    }

    return this.prismaService.account_plan.findMany({
      where: {
        tax_payer: {
          id: tax_payer_id,
        },
      },
      select: {
        code: true,
        account_name: true,
        id: true,
      },
    });
  }

  async createAccountCode(
    tax_payer_id?: string,
    createAccountCodeDto?: CreateAccountCodeDto,
  ) {
    if (!tax_payer_id) {
      throw new HttpException('Tax payer id is required', 400);
    }

    const isAlreadyExists = await this.prismaService.account_plan.findFirst({
      where: {
        account_name: createAccountCodeDto.account_name,
        code: createAccountCodeDto.account_code,
      },
    });

    if (isAlreadyExists) {
      throw new HttpException(
        'Account code or Account name already exists',
        400,
      );
    }

    return this.prismaService.account_plan.create({
      data: {
        account_plan_id: uuid(),
        account_name: createAccountCodeDto.account_name,
        code: createAccountCodeDto.account_code,
        tax_payer: {
          connect: {
            id: tax_payer_id,
          },
        },
      },
    });
  }

  async updateAccountCode(
    tax_payer_id?: string,
    updateAccountCodeDto?: UpdateAccountCodeDto,
  ) {
    if (!tax_payer_id) {
      throw new HttpException('Tax payer id is required', 400);
    }

    const find = await this.prismaService.account_plan.findFirst({
      where: {
        id: updateAccountCodeDto.id,
        tax_payer: {
          id: tax_payer_id,
        },
      },
    });

    if (!find) {
      throw new HttpException('Account code not found', 404);
    }

    return this.prismaService.account_plan.update({
      where: {
        id: find.id,
      },
      data: {
        code: updateAccountCodeDto.account_code,
        account_name: updateAccountCodeDto.account_name,
      },
    });
  }

  remove(id: string) {
    return this.prismaService.account_plan.delete({
      where: {
        id,
      },
    });
  }

  removeByTaxPayerId(tax_payer_id: string) {
    return this.prismaService.account_plan.deleteMany({
      where: {
        tax_payer: {
          id: tax_payer_id,
        },
      },
    });
  }
}
