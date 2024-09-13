import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FeaturesDto {
  @IsOptional()
  @Type(() => String)
  readonly sort: string;
  @IsOptional()
  @Type(() => String)
  readonly fields: string;
}
