import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Roles } from '@decorators/role.decorator';
import { ROLE } from '@enums/role.enum';
import { AuthGuard } from '@guards/auth.guard';

import { PaymentService } from './payment.service';
import type { PayDto } from './dto/pay.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Post()
  async pay(@Req() request: Request, @Body() payDto: PayDto) {
    return this.paymentService.pay({ user_id: request['user']?.id, payDto });
  }
}
