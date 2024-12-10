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

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TaxPayerCountDto } from './dto/tax-payer-count.dto';
import { InvoiceCountDto } from './dto/invoice-count.dto';
import { VoucherCountDto } from './dto/voucher-count.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.userService.findAll({ page: +page, limit: +limit });
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Get()
  findOne(@Query('id') id?: string, @Query('email') email?: string) {
    if (id) {
      return this.userService.findById(id);
    }

    if (email) {
      return this.userService.findByEmail(id);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Post(':id/count/tax-payer')
  taxPayerCount(
    @Param('id') id: string,
    @Body() taxPayerCountDto: TaxPayerCountDto,
  ) {
    return this.userService.taxPayerCount(id, taxPayerCountDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Post(':id/count/invoice')
  invoiceCount(
    @Param('id') id: string,
    @Body() invoiceCountDto: InvoiceCountDto,
  ) {
    return this.userService.invoiceCount(id, invoiceCountDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Post(':id/count/voucher')
  voucherCount(
    @Param('id') id: string,
    @Body() voucherCountDto: VoucherCountDto,
  ) {
    return this.userService.voucherCount(id, voucherCountDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Get(':id/count/credit')
  remainingCredit(@Param('id') id: string) {
    return this.userService.remainingCredit(id);
  }
}
