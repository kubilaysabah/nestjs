import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { PrismaService } from '@services/prisma.service';
import { PaginateService } from '@services/paginate.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TaxPayerCountDto } from './dto/tax-payer-count.dto';
import { InvoiceCountDto } from './dto/invoice-count.dto';
import { VoucherCountDto } from './dto/voucher-count.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(createUserDto.password, salt);

    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        credit: 0,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        phone: true,
        credit: true,
        status: true,
      },
    });
  }

  async findAll({ page, limit }: { page?: number; limit: number }) {
    return this.paginateService.paginate({
      model: this.prismaService.user,
      page,
      limit,
      select: {
        id: true,
        credit: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
      },
    });
  }

  findById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        phone: true,
        credit: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const salt = bcrypt.genSaltSync(10);
    const { password, ...model } = updateUserDto;
    const hashedPassword = bcrypt.hashSync(password, salt);

    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...model,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        phone: true,
        credit: true,
      },
    });
  }

  async remove(id: string) {
    return this.prismaService.user.delete({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        phone: true,
        credit: true,
      },
    });
  }

  taxPayerCount(id: string, taxPayerCountDto: TaxPayerCountDto) {
    return this.prismaService.tax_payer.count({
      where: {
        user_id: id,
        created_at: {
          gte: taxPayerCountDto.start_date,
          lte: taxPayerCountDto.end_date,
        },
      },
    });
  }

  invoiceCount(id: string, invoiceCountDto: InvoiceCountDto) {
    return this.prismaService.invoice.count({
      where: {
        tax_payer: {
          user_id: id,
        },
        type: invoiceCountDto.type,
        invoice_date: {
          gte: invoiceCountDto.start_date,
          lte: invoiceCountDto.end_date,
        },
      },
    });
  }

  voucherCount(id: string, voucherCountDto: VoucherCountDto) {
    return this.prismaService.voucher.count({
      where: {
        tax_payer: {
          user_id: id,
        },
        created_at: {
          gte: voucherCountDto.start_date,
          lte: voucherCountDto.end_date,
        },
      },
    });
  }

  async remainingCredit(id: string) {
    const data = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        credit: true,
      },
    });

    return data.credit;
  }
}
