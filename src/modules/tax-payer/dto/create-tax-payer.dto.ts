import { Decimal } from 'decimal.js';

import {
  IsEmail,
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsDecimal,
} from 'class-validator';

export class CreateTaxPayerDto {
  @IsString({ message: 'turkish_identity_number must be a string' })
  @IsOptional()
  readonly turkish_identity_number?: string;

  @IsString({ message: 'firstname must be a string' })
  @IsOptional()
  readonly firstname?: string;

  @IsString({ message: 'lastname must be a string' })
  @IsOptional()
  readonly lastname?: string;

  @IsString({ message: 'phone must be a string' })
  @IsOptional()
  readonly phone?: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString({ message: 'activity_id must be a string' })
  @IsOptional()
  readonly activity_id?: string;

  @IsString({ message: 'tax_number must be a string' })
  @IsOptional()
  readonly tax_number?: string;

  @IsString({ message: 'tax_office must be a string' })
  @IsOptional()
  readonly tax_office?: string;

  @IsString({ message: 'tax_office_code must be a string' })
  @IsOptional()
  readonly tax_office_code?: string;

  @IsString({ message: 'trade_register_number must be a string' })
  @IsOptional()
  readonly trade_register_number?: string;

  @IsString({ message: 'central_registry_system_number must be a string' })
  @IsOptional()
  readonly central_registry_system_number?: string;

  @IsDate({ message: 'opening_date must be a string' })
  @IsOptional()
  readonly opening_date?: Date;

  @IsDate({ message: 'closing_date must be a string' })
  @IsOptional()
  readonly closing_date?: Date;

  @IsDate({ message: 'registration_date must be a string' })
  @IsOptional()
  readonly registration_date?: Date;

  @IsString({ message: 'registration_place must be a string' })
  @IsOptional()
  readonly registration_place?: string;

  @IsBoolean()
  @IsOptional()
  readonly tax_obligation?: boolean;

  @IsDecimal()
  @IsOptional()
  readonly subscribed_capital?: Decimal;

  @IsDecimal()
  @IsOptional()
  readonly paid_capital?: Decimal;

  @IsString({ message: 'ssi must be a string' })
  @IsOptional()
  readonly ssi?: string;

  @IsString({ message: 'professional_organizations must be a string' })
  @IsOptional()
  readonly professional_organizations?: string;

  @IsString({ message: 'professional_organizations_number must be a string' })
  @IsOptional()
  readonly professional_organizations_number?: string;

  @IsBoolean()
  @IsOptional()
  readonly simple_entry?: boolean;

  @IsString({ message: 'integrator_client_id must be a string' })
  @IsOptional()
  readonly integrator_client_id?: string;

  @IsString({ message: 'integrator_client_secret must be a string' })
  @IsOptional()
  readonly integrator_client_secret?: string;

  @IsString({ message: 'integrator_username must be a string' })
  @IsOptional()
  readonly integrator_username?: string;

  @IsString({ message: 'integrator_password must be a string' })
  @IsOptional()
  readonly integrator_password?: string;

  @IsString({ message: 'integrator_id must be a string' })
  @IsOptional()
  readonly integrator_id?: string;
}
