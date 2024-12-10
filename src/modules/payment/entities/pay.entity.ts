import { IsString } from 'class-validator';

export class PayEntity {
  @IsString()
  readonly statusCode: string;

  @IsString()
  readonly resultCode: string;

  @IsString()
  readonly resultMessage: string;

  @IsString()
  readonly redirectUrl: string;
}
