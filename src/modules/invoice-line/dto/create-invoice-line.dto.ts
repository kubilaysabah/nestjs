import {
  IsString,
  ValidateNested,
  IsOptional,
  IsDecimal,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Tax {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty()
  readonly name: string;

  @IsString({ message: 'name must be a string' })
  @IsNotEmpty()
  readonly code: string;

  @IsString({ message: 'name must be a string' })
  @IsNotEmpty()
  readonly currency: string;

  @IsDecimal()
  @IsNotEmpty()
  readonly rate: number;

  @IsDecimal()
  @IsNotEmpty()
  readonly amount: number;
}

export class CreateInvoiceLineDto {
  @IsString({ message: 'invoice_type must be a string' })
  @IsOptional()
  readonly invoice_type?: string;

  @IsString({ message: 'name must be a string' })
  @IsOptional()
  readonly name?: string;

  @IsString({ message: 'description must be a string' })
  @IsOptional()
  readonly account_code?: string;

  @IsString({ message: 'product_code must be a string' })
  @IsOptional()
  readonly product_code?: string;

  @IsString({ message: 'unit must be a string' })
  @IsOptional()
  readonly unit?: string;

  @IsString({ message: 'stoppage_code must be a string' })
  @IsOptional()
  readonly stoppage_code?: string;

  @IsDecimal()
  @IsOptional()
  readonly quantity?: number;

  @IsDecimal()
  @IsOptional()
  readonly unit_amount?: number;

  @IsDecimal()
  @IsOptional()
  readonly product_amount?: number;

  @IsString({ message: 'currency must be a string' })
  @IsOptional()
  readonly currency?: string;

  @IsArray({ message: 'taxes must be an array' })
  @ValidateNested({ each: true })
  @Type(() => Tax)
  readonly taxes: Tax[];

  @IsString({ message: 'invoice_id must be a string' })
  @IsNotEmpty()
  readonly invoice_id: string;
}
