import { IsString, IsNotEmpty, IsDecimal } from 'class-validator';

export class PayDto {
  @IsNotEmpty({ message: 'price is required' })
  @IsDecimal()
  readonly price: string;

  @IsString({ message: 'errorURL must be a string' })
  readonly errorURL: string;

  @IsString({ message: 'successURL must be a string' })
  readonly successURL: string;

  @IsString({ message: 'content must be a string' })
  @IsNotEmpty({ message: 'content is required' })
  readonly content: string;

  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'description is required' })
  readonly description: string;
}
