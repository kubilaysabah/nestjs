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

import { InvoiceLineService } from './invoice-line.service';
import { CreateInvoiceLineDto } from './dto/create-invoice-line.dto';
import { UpdateInvoiceLineDto } from './dto/update-invoice-line.dto';
import { AssignAccountPlanDto } from './dto/assign-account-plan.dto';

@Controller('invoice-line')
export class InvoiceLineController {
  constructor(private readonly invoiceLineService: InvoiceLineService) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Post()
  create(@Body() createInvoiceLineDto: CreateInvoiceLineDto) {
    return this.invoiceLineService.create(createInvoiceLineDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Get()
  findAll(
    @Query('invoice_id') invoice_id?: string,
    @Query('tax_payer_id') tax_payer_id?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoiceLineService.findAll({
      page: +page,
      limit: +limit,
      tax_payer_id,
      invoice_id,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceLineService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceLineDto: UpdateInvoiceLineDto,
  ) {
    return this.invoiceLineService.update(id, updateInvoiceLineDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Patch('account-code/:id')
  assignAccountCode(
    @Param('id') id: string,
    @Body() assignAccountPlanDto: AssignAccountPlanDto,
  ) {
    return this.invoiceLineService.assignAccountCode(id, assignAccountPlanDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceLineService.remove(id);
  }
}
