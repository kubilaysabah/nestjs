import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '@decorators/role.decorator';
import { ROLE } from '@enums/role.enum';
import { AuthGuard } from '@guards/auth.guard';
import { TaxPayerGuard } from '@guards/tax-payer.guard';

import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { AssignAccountPlanDto } from './dto/assign-account-plan.dto';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Req() request: Request,
    @Query('ETTN') ETTN?: string,
    @Query('tax_payer_id') tax_payer_id?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.invoiceService.findAll({
      page: +page,
      limit: +limit,
      tax_payer_id,
      user_id: request['user']?.id,
      ETTN,
      startDate,
      endDate,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Patch('account-code/:id')
  assignAccountCode(
    @Param('id') id: string,
    @Body() assignAccountPlanDto: AssignAccountPlanDto,
  ) {
    return this.invoiceService.assignAccountPlan(id, assignAccountPlanDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Delete('taxes/:id')
  removeTaxes(@Param('id') id: string) {
    return this.invoiceService.removeInvoiceTaxesById(id);
  }
}
