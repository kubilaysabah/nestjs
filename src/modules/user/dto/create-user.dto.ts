import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'firstname is required' })
  @IsString({ message: 'firstname must be a string' })
  readonly firstname: string;

  @IsNotEmpty({ message: 'lastname is required' })
  @IsString({ message: 'lastname must be a string' })
  readonly lastname: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty({ message: 'phone is required' })
  @IsString({ message: 'phone must be a string' })
  readonly phone: string;

  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'firstname is required' })
  readonly password: string;

  @IsOptional()
  @IsBoolean()
  readonly status?: boolean;

  @IsNotEmpty({ message: 'credit is required' })
  @IsInt({ message: 'credit must be a integer' })
  readonly credit: number;
}
