import { IsOptional, IsDate } from 'class-validator';

export class TaxPayerCountDto {
  @IsDate({ message: 'start_date must be a ISO8601 string' })
  @IsOptional()
  readonly start_date?: string;

  @IsDate({ message: 'end_date must be a ISO8601 string' })
  @IsOptional()
  readonly end_date?: string;
}
