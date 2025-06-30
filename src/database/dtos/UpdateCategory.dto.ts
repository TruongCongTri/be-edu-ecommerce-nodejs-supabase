// src/database/dtos/UpdateCategory.dto.ts
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: "Category name must be a string." })
  @Length(2, 100, {
    message: "Category name must be between 2 and 100 characters.",
  })
  name?: string;

  @IsOptional()
  @IsString({ message: "Description must be a string." })
  description?: string;
}
