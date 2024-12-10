import { IsString, IsNotEmpty } from 'class-validator';

export class CreateActivityDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  readonly name: string;

  @IsString({ message: 'code must be a string' })
  @IsNotEmpty({ message: 'code is required' })
  readonly code: string;
}
