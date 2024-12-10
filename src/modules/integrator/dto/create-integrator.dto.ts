import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateIntegratorDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly phone?: string;

  @IsString()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly city?: string;
}
