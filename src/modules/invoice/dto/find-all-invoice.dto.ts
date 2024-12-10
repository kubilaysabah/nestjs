import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class FindAllInvoiceDto {
  @IsInt({ message: 'page must be an integer' })
  @IsOptional()
  readonly page?: number;

  @IsInt({ message: 'limit must be an integer' })
  @IsOptional()
  readonly limit?: number;

  @IsString({ message: 'tax_payer_id must be a string' })
  @IsOptional()
  readonly tax_payer_id?: string;

  @IsString({ message: 'user_id must be a string' })
  @IsOptional()
  readonly user_id?: string;

  @IsString({ message: 'ETTN must be a string' })
  @IsOptional()
  readonly ETTN?: string;

  @IsDate({ message: 'startDate must be a date' })
  @IsOptional()
  readonly startDate?: Date;

  @IsDate({ message: 'endDate must be a date' })
  @IsOptional()
  readonly endDate?: Date;
}
