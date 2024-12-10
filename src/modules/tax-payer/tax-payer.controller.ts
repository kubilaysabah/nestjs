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
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Roles } from '@decorators/role.decorator';
import { ROLE } from '@enums/role.enum';
import { AuthGuard } from '@guards/auth.guard';
import { TaxPayerGuard } from '@guards/tax-payer.guard';

import { TaxPayerService } from './tax-payer.service';
import { CreateTaxPayerDto } from './dto/create-tax-payer.dto';
import { UpdateTaxPayerDto } from './dto/update-tax-payer.dto';

@Controller('tax-payer')
export class TaxPayerController {
  constructor(private readonly taxPayerService: TaxPayerService) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Req() request: Request,
    @Body() createTaxPayerDto: CreateTaxPayerDto,
  ) {
    return this.taxPayerService.create({
      createTaxPayerDto,
      user_id: request['user']?.id,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Req() request: Request,
    @Query('integrator_id') integrator_id?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.taxPayerService.findAll({
      integrator_id,
      user_id: request['user']?.id,
      page: +page,
      limit: +limit,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxPayerService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Patch(':id')
  update(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updateTaxPayerDto: UpdateTaxPayerDto,
  ) {
    return this.taxPayerService.update({
      id,
      user_id: request['user']?.id,
      updateTaxPayerDto,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taxPayerService.remove(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Get('match-invoices/:id')
  matchInvoices(@Param('id') id: string) {
    return this.taxPayerService.matchInvoices(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Get('match-invoice-lines/:id')
  matchInvoiceLines(@Param('id') id: string) {
    return this.taxPayerService.matchInvoiceLines(id);
  }
}
