import {
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsNumber,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class JobFilterParams {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  skillIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  locationIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  per_page?: number;
}
