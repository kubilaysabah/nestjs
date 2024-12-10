import {
  IsString,
  IsOptional,
  IsDecimal,
  IsDate,
  IsNotEmpty,
} from 'class-validator';

export class CreateVoucherDto {
  @IsString({ message: 'account_name must be a string' })
  @IsOptional()
  readonly account_name?: string;

  @IsString({ message: 'account_code must be a string' })
  @IsOptional()
  readonly account_code?: string;

  @IsString({ message: 'invoice_type must be a string' })
  @IsOptional()
  readonly invoice_type?: string;

  @IsDate({ message: 'invoice_date must be a date' })
  @IsOptional()
  readonly invoice_date?: string;

  @IsString({ message: 'invoice_number must be a string' })
  @IsOptional()
  readonly invoice_number?: string;

  @IsString({ message: 'stock_code must be a string' })
  @IsOptional()
  readonly stock_code?: string;

  @IsDecimal()
  @IsOptional()
  readonly amount?: number;

  @IsString({
    message: 'vat_number_or_turkish_identity_number must be a string',
  })
  @IsOptional()
  readonly vat_number_or_turkish_identity_number?: string;

  @IsString({ message: 'description must be a string' })
  @IsOptional()
  readonly description?: string;

  @IsDecimal()
  @IsOptional()
  readonly quantity?: number;

  @IsDecimal()
  @IsOptional()
  readonly vat_rate?: number;

  @IsDecimal()
  @IsOptional()
  readonly vat_amount?: number;

  @IsString({ message: 'stoppage_type_code must be a string' })
  @IsOptional()
  readonly stoppage_code?: string;

  @IsString({ message: 'tax_payer_id must be a string' })
  @IsNotEmpty({ message: 'tax_payer_id is required' })
  readonly tax_payer_id: string;

  @IsDecimal()
  @IsOptional()
  readonly stoppage_rate?: number;

  @IsDecimal()
  @IsOptional()
  readonly stoppage_amount?: number;

  @IsDecimal()
  @IsOptional()
  readonly debt?: number;

  @IsDecimal()
  @IsOptional()
  readonly credit?: number;

  @IsString({ message: 'invoice_line_id must be a string' })
  @IsOptional()
  readonly invoice_line_id?: string;

  @IsString({ message: 'invoice_id must be a string' })
  @IsOptional()
  readonly invoice_id?: string;
}
