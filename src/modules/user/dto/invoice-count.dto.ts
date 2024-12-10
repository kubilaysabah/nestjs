import { IsDate, IsInt, IsOptional } from 'class-validator';

export class InvoiceCountDto {
  @IsInt({ message: 'type must be a number' })
  @IsOptional()
  readonly type?: number;

  @IsDate({ message: 'start_date must be a ISO8601 string' })
  @IsOptional()
  readonly start_date?: string;

  @IsDate({ message: 'end_date must be a ISO8601 string' })
  @IsOptional()
  readonly end_date?: string;
}
