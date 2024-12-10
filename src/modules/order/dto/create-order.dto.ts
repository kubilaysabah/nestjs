import { IsString, IsNotEmpty, IsInt, IsDecimal } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  readonly company_name: string;

  @IsNotEmpty()
  @IsString()
  readonly tax_number_or_turkish_identity_number: string;

  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @IsNotEmpty()
  @IsInt({ message: 'credit must be a number' })
  readonly credit: number;

  @IsNotEmpty()
  @IsDecimal()
  readonly price: string;
}
