import {
  IsString,
  ValidateNested,
  IsOptional,
  IsDecimal,
  IsNotEmpty,
  IsArray,
  IsDate,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from 'decimal.js';
import { CreateInvoiceTaxDto } from './create-invoice-tax.dto';

export class CreateInvoiceDto {
  @IsString({ message: 'ETTN must be a string' })
  @IsNotEmpty()
  readonly ETTN: string;

  @IsString({ message: 'name must be a string' })
  @IsOptional()
  readonly name?: string;

  @IsString({ message: 'account_code must be a string' })
  @IsOptional()
  readonly account_code?: string;

  @IsString({
    message: 'tax_number_or_turkish_identity_number must be a string',
  })
  @IsOptional()
  readonly tax_number_or_turkish_identity_number?: string;

  @IsString({ message: 'invoice_number must be a string' })
  @IsOptional()
  readonly invoice_number?: string;

  @IsDate({ message: 'invoice_date must be a date' })
  @IsOptional()
  readonly invoice_date?: string;

  @IsString({ message: 'invoice_type must be a string' })
  @IsOptional()
  readonly invoice_type?: string;

  @IsString({ message: 'scenario must be a string' })
  @IsOptional()
  readonly scenario?: string;

  @IsString({ message: 'stoppage_code must be a string' })
  @IsOptional()
  readonly stoppage_code?: string;

  @IsDecimal()
  @IsOptional()
  readonly total_amount?: Decimal;

  @IsDecimal()
  @IsOptional()
  readonly product_or_service_amount?: Decimal;

  @IsDecimal()
  @IsOptional()
  readonly total_amount_including_taxes?: Decimal;

  @IsDecimal()
  @IsOptional()
  readonly total_amount_excluding_taxes?: Decimal;

  @IsOptional()
  @IsDecimal()
  readonly discount_amount?: Decimal;

  @IsOptional()
  @IsDecimal()
  readonly discount_rate?: Decimal;

  @IsOptional()
  @IsDecimal()
  readonly increase_rate?: Decimal;

  @IsOptional()
  @IsDecimal()
  readonly increase_amount?: Decimal;

  @IsNotEmpty({ message: 'type is required' })
  @IsInt({ message: 'type must be a number' })
  readonly type: number;

  @IsNotEmpty({ message: 'type is required' })
  @IsDecimal()
  readonly vat_rate: number;

  @IsNotEmpty({ message: 'type is required' })
  @IsDecimal()
  readonly vat_amount: number;

  @IsString({ message: 'currency must be a string' })
  @IsOptional()
  readonly currency?: string;

  @IsString({ message: 'tax_payer_id must be a string' })
  @IsNotEmpty()
  readonly tax_payer_id: string;

  @IsArray({ message: 'taxes must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceTaxDto)
  readonly taxes: CreateInvoiceTaxDto[];
}
