import { IsString, IsNotEmpty } from 'class-validator';

export class UploadAccountPlanDto {
  @IsString({ message: 'tax_payer_id must be a string' })
  @IsNotEmpty({ message: 'tax_payer_id is required' })
  readonly tax_payer_id: string;
}
