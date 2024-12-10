import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '@decorators/role.decorator';
import { ROLE } from '@enums/role.enum';
import { AuthGuard } from '@guards/auth.guard';

import { UtilsService } from './utils.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthGuard)
  @Post('activity/create')
  create(@Body() createActivityDto: CreateActivityDto[]) {
    return this.utilsService.createActivities(createActivityDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Get('activities')
  activities(@Query('page') page: string, @Query('limit') limit: string) {
    return this.utilsService.activities({ page: +page, limit: +limit });
  }
}
