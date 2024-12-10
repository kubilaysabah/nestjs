import { PartialType } from '@nestjs/mapped-types';
import { CreateIntegratorDto } from './create-integrator.dto';

export class UpdateIntegratorDto extends PartialType(CreateIntegratorDto) {}
