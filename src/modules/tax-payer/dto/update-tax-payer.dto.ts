import { PartialType } from '@nestjs/mapped-types';
import { CreateTaxPayerDto } from './create-tax-payer.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTaxPayerDto extends PartialType(CreateTaxPayerDto) {
  @IsString()
  @IsNotEmpty()
  integratorId: string;
}
