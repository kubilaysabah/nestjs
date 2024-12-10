import { IsString, IsObject, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class NomupayResponse {
  @IsString()
  readonly Key: string;

  @IsString()
  readonly Value: string;
}

export class NomupayResultItem {
  @IsObject()
  @ValidateNested()
  @Type(() => NomupayResponse)
  readonly $: NomupayResponse;
}

export class NomupayResult {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NomupayResultItem)
  readonly Item: NomupayResultItem[];
}

export class NomupayEntity {
  @IsObject()
  @ValidateNested()
  @Type(() => NomupayResult)
  readonly Result: NomupayResult;
}
