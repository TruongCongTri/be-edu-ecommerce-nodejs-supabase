import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseQueryParamsDto {
  @IsOptional()
  @Type(() => Number) // Ensure the value is converted to a number
  @IsInt({ message: 'Page must be an integer.' })
  @Min(1, { message: 'Page must be at least 1.' })
  page?: number = 1; // Default to page 1

  @IsOptional()
  @Type(() => Number) // Ensure the value is converted to a number
  @IsInt({ message: 'Per page must be an integer.' })
  @Min(1, { message: 'Per page must be at least 1.' })
  @Max(100, { message: 'Per page cannot exceed 100.' }) // Cap to prevent abuse
  per_page?: number = 10; // Default to 10 items per page

  @IsOptional()
  @IsString({ message: 'Search term must be a string.' })
  search?: string; // Generic search term
}