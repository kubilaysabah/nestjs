import {
  Controller,
  HttpCode,
  Sse,
  HttpStatus,
  UseGuards,
  MessageEvent,
  Req,
  Query,
  HttpException,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';

import { AuthGuard } from '@guards/auth.guard';
import { TaxPayerGuard } from '@guards/tax-payer.guard';

import { Roles } from '@decorators/role.decorator';
import { ROLE } from '@enums/role.enum';

import { UyumSoftService } from './uyumsoft.service';

@Controller('uyumsoft')
export class UyumsoftController {
  constructor(private readonly uyumsoftService: UyumSoftService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Roles(ROLE.USER)
  @Sse('incoming-invoices')
  incomingInvoice(
    @Req() request: Request,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Observable<MessageEvent> {
    const tax_payer_id = request.headers['tax_payer_id'];

    if (typeof tax_payer_id === 'string') {
      this.uyumsoftService.incomingInvoice({
        tax_payer_id,
        start_date,
        end_date,
        page: page ? +page : 1,
        limit: limit ? +limit : 20,
      });

      return this.uyumsoftService.getProgress().pipe(map((data) => ({ data })));
    }

    throw new HttpException('Tax payer id is required', HttpStatus.BAD_REQUEST);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Roles(ROLE.USER)
  @Sse('outgoing-invoices')
  outgoingInvoice(
    @Req() request: Request,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const tax_payer_id = request.headers['tax_payer_id'];

    if (typeof tax_payer_id === 'string') {
      this.uyumsoftService.outgoingInvoice({
        tax_payer_id,
        start_date,
        end_date,
        page: page ? +page : 1,
        limit: limit ? +limit : 20,
      });

      return this.uyumsoftService.getProgress().pipe(map((data) => ({ data })));
    }

    throw new HttpException('Tax payer id is required', HttpStatus.BAD_REQUEST);
  }
}
