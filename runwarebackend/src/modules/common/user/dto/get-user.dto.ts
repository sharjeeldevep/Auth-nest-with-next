import { IntersectionType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { FeaturesDto } from '../../../../common/dtos/features.dto';
import { PaginationDto } from '../../../../common/dtos/pagination.dto';
import { PopulateFieldsDto } from '../../../../common/dtos/populate.dto';

export class FilterUserDto {
  @IsOptional()
  @Type(() => String)
  readonly name: string;

  @IsOptional()
  @Type(() => String)
  readonly phoneNumber: string;

  @IsOptional()
  @Type(() => String)
  readonly role: string;
}

export class GetUserDto extends IntersectionType(
  FilterUserDto,
  FeaturesDto,
  PaginationDto,
  PopulateFieldsDto,
) {}
