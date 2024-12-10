import { IsNotEmpty, IsUUID, IsDate, IsOptional, IsInt } from 'class-validator';

export class IncomingInvoicesDto {
  @IsUUID()
  @IsNotEmpty()
  readonly tax_payer_id: string;

  @IsOptional()
  @IsDate({ message: 'start_date must be a date' })
  readonly start_date?: string;

  @IsOptional()
  @IsDate({ message: 'end_date must be a date' })
  readonly end_date?: string;

  @IsInt({ message: 'page must be a number' })
  @IsOptional()
  readonly page?: number;

  @IsInt({ message: 'limit must be a number' })
  @IsOptional()
  readonly limit?: number;
}
