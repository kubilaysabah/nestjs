import { Decimal } from 'decimal.js';
import {
  ValidateNested,
  IsArray,
  IsString,
  IsUUID,
  IsDate,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceTaxDto } from '../dto/create-invoice-tax.dto';

export class Invoice {
  @IsNotEmpty()
  @IsUUID()
  readonly id: string;

  @IsNotEmpty()
  @IsUUID()
  readonly ETTN: string;

  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly tax_number_or_turkish_identity_number?: string;

  @IsOptional()
  @IsString()
  readonly invoice_number?: string;

  @IsOptional()
  @IsDate()
  readonly invoice_date?: Date;

  @IsOptional()
  @IsString()
  readonly invoice_type?: string;

  @IsOptional()
  @IsString()
  readonly scenario?: string;

  @IsOptional()
  @IsDecimal()
  readonly total_amount?: Decimal;

  @IsOptional()
  @IsDecimal()
  readonly product_or_service_amount?: Decimal;

  @IsOptional()
  @IsDecimal()
  readonly total_amount_including_taxes?: Decimal;

  @IsOptional()
  @IsDecimal()
  readonly total_amount_excluding_taxes?: Decimal;

  @IsOptional()
  @IsDecimal()
  readonly vat_rate?: Decimal;

  @IsOptional()
  @IsDecimal()
  readonly vat_amount?: Decimal;

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

  @IsOptional()
  @IsString()
  readonly stoppage_code?: string;

  @IsOptional()
  @IsArray({ each: true })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceTaxDto)
  readonly taxes?: CreateInvoiceTaxDto[];

  @IsOptional()
  @IsString()
  readonly currency?: string;

  @IsNotEmpty()
  @IsUUID()
  readonly tax_payer_id: string;

  @IsOptional()
  @IsUUID()
  readonly account_plan_id?: string;

  @IsOptional()
  @IsInt()
  readonly type: number;

  @IsOptional()
  @IsDate()
  readonly created_at?: Date;

  @IsOptional()
  @IsDate()
  readonly updated_at?: Date;
}
