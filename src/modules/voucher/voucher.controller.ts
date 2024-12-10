import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '@decorators/role.decorator';
import { ROLE } from '@enums/role.enum';
import { AuthGuard } from '@guards/auth.guard';
import { TaxPayerGuard } from '@guards/tax-payer.guard';

import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.voucherService.create(createVoucherDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Get('tax-payer/:tax_payer_id')
  findByTaxPayerId(
    @Param('tax_payer_id') tax_payer_id: string,
    @Query('invoice_id') invoice_id?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.voucherService.findByTaxPayerId({
      invoice_id,
      tax_payer_id,
      page: +page,
      limit: +limit,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Get('export-excel/:tax_payer_id')
  exportExcel(@Param('tax_payer_id') tax_payer_id: string) {
    return this.voucherService.exportExcel(tax_payer_id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voucherService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    return this.voucherService.update(id, updateVoucherDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.voucherService.remove(id);
  }
}
