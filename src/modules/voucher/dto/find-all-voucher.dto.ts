import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class FindAllVoucherDto {
  @IsString({ message: 'Invoice id must be a string' })
  @IsOptional()
  readonly invoice_id?: string;

  @IsString({ message: 'Tax payer id must be a string' })
  @IsNotEmpty({ message: 'Tax payer id is required' })
  readonly tax_payer_id: string;

  @IsInt({ message: 'Page must be an integer' })
  @IsOptional()
  readonly page?: number;

  @IsInt({ message: 'Limit must be an integer' })
  @IsOptional()
  readonly limit?: number;

  @IsInt({ message: 'Limit must be an integer' })
  @IsOptional()
  readonly type?: number;
}
