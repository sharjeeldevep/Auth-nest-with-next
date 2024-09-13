import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class PopulateFieldsDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  readonly populateFields: string[];
}
