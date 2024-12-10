import {
  Controller,
  Get,
  Post,
  Patch,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  Body,
  Param,
  Query,
  Delete,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { AuthGuard } from '@guards/auth.guard';
import { TaxPayerGuard } from '@guards/tax-payer.guard';
import { Roles } from '@decorators/role.decorator';
import { ROLE } from '@enums/role.enum';

import { AccountPlanService } from './account-plan.service';
import { CreateAccountCodeDto } from './dto/create-account-code.dto';
import { UpdateAccountCodeDto } from './dto/update-account-code.dto';

@Controller('account-plan')
export class AccountPlanController {
  constructor(private readonly accountPlanService: AccountPlanService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Roles(ROLE.USER)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
    const tax_payer_id = request.headers['tax_payer_id'];

    if (typeof tax_payer_id === 'string') {
      return this.accountPlanService.upload(file, tax_payer_id);
    }

    throw new HttpException('Tax payer id is required', HttpStatus.BAD_REQUEST);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Roles(ROLE.USER)
  @Get(':tax_payer_id')
  findByTaxPayerId(
    @Param('tax_payer_id') tax_payer_id?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.accountPlanService.findByTaxPayerId({
      page: +page,
      limit: +limit,
      tax_payer_id,
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Roles(ROLE.USER)
  @Get('account-codes/:tax_payer_id')
  getAccountCodes(@Param('tax_payer_id') tax_payer_id?: string) {
    return this.accountPlanService.findAccountCodesByTaxPayerId(tax_payer_id);
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Roles(ROLE.USER)
  @Post('account-code/:tax_payer_id')
  createAccountCode(
    @Param('tax_payer_id') tax_payer_id: string,
    @Body() createAccountCodeDto: CreateAccountCodeDto,
  ) {
    return this.accountPlanService.createAccountCode(
      tax_payer_id,
      createAccountCodeDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Roles(ROLE.USER)
  @Patch('account-code/:tax_payer_id')
  updateAccountCode(
    @Param('tax_payer_id') tax_payer_id: string,
    @Body() updateAccountCodeDto: UpdateAccountCodeDto,
  ) {
    return this.accountPlanService.updateAccountCode(
      tax_payer_id,
      updateAccountCodeDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Roles(ROLE.USER)
  @Delete('tax-payer/:tax_payer_id')
  removeByTaxPayerId(@Param('tax_payer_id') tax_payer_id: string) {
    return this.accountPlanService.removeByTaxPayerId(tax_payer_id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, TaxPayerGuard)
  @Roles(ROLE.USER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountPlanService.remove(id);
  }
}
