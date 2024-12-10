import { IsString, IsNotEmpty } from 'class-validator';

export class AssignAccountPlanDto {
  @IsNotEmpty({ message: 'account_plan_id is required' })
  @IsString({ message: 'account_plan_id must be a string' })
  readonly account_plan_id: string;
}
