import {
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { BaseQueryParamsDto } from "./base-query-params.dto";

export class FilterProductQueryParamsDto extends BaseQueryParamsDto {
  @IsOptional()
  // 1. @Transform comes first to handle the array conversion explicitly.
  //    This ensures that by the time @IsArray() and @IsString({each: true}) run,
  //    the value is ALWAYS an array (or undefined/null).
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return undefined; // Ensure optionality, return undefined for empty string too
    }
    // If it's already an array, return it as is
    if (Array.isArray(value)) {
      return value;
    }
    // If it's a non-empty string, wrap it in an array
    if (typeof value === "string") {
      return [value];
    }
    // For any other unexpected type, return it as is, validation will catch it
    return value;
  })
  // 2. @IsArray() now expects an array, which @Transform guarantees.
  @IsArray()
  // 3. @IsString({ each: true }) now iterates over a guaranteed array.
  @IsString({ each: true, message: "Each category slug must be a string." })
  // 4. @Type(() => String) is generally not strictly needed here for primitive arrays
  //    when @Transform handles the primary coercion, but can act as a fallback hint.
  //    You can try with/without it. Often, it's more for nested objects.
  // @Type(() => String) // Keep if you find other implicit conversions for elements useful
  category_slugs?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    // console.log('Transforming skill_slugs:', value, typeof value); // Debugging
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      return [value];
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true, message: "Each skill slug must be a string." })
  skill_slugs?: string[];

  @IsOptional()
  //   @Type(() => Number)
  //   @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  min_price?: number;

  @IsOptional()
  //   @Type(() => Number)
  //   @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  max_price?: number;
}
