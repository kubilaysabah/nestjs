import { IsDecimal, IsNotEmpty, IsString } from 'class-validator';

export class CreateInvoiceTaxDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty()
  readonly name: string;

  @IsString({ message: 'code must be a string' })
  @IsNotEmpty()
  readonly code: string;

  @IsString({ message: 'currency must be a string' })
  @IsNotEmpty()
  readonly currency: string;

  @IsDecimal()
  @IsNotEmpty()
  readonly rate: number;

  @IsDecimal()
  @IsNotEmpty()
  readonly amount: number;
}
