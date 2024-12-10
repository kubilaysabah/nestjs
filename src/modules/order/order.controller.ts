import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';

import { Roles } from '@decorators/role.decorator';
import { ROLE } from '@enums/role.enum';
import { AuthGuard } from '@guards/auth.guard';

import { CreateOrderDto } from '@order/dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Post()
  create(@Req() request: Request, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(request['user'].id, createOrderDto);
  }
}
