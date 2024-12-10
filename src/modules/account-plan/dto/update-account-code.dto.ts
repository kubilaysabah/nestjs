import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAccountCodeDto {
  @IsString({ message: 'id must be a string' })
  @IsNotEmpty({ message: 'id is required' })
  readonly id: string;

  @IsString({ message: 'account_code must be a string' })
  @IsNotEmpty({ message: 'account_code is required' })
  readonly account_code: string;

  @IsString({ message: 'account_name must be a string' })
  @IsNotEmpty({ message: 'account_name is required' })
  readonly account_name: string;
}
