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

import { IntegratorService } from './integrator.service';
import { CreateIntegratorDto } from './dto/create-integrator.dto';
import { UpdateIntegratorDto } from './dto/update-integrator.dto';

@Controller('integrator')
export class IntegratorController {
  constructor(private readonly integratorService: IntegratorService) {}

  @HttpCode(HttpStatus.CREATED)
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createIntegratorDto: CreateIntegratorDto[]) {
    return this.integratorService.create(createIntegratorDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.integratorService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.USER)
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.integratorService.findAll({
      limit: +limit,
      page: +page,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIntegratorDto: UpdateIntegratorDto,
  ) {
    return this.integratorService.update(id, updateIntegratorDto);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.integratorService.remove(id);
  }
}
