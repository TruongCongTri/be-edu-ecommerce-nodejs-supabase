// src/database/dtos/UpdateJob.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsUUID,
  IsArray,
  ArrayUnique,
  Length,
} from "class-validator";
import { EmploymentType, ExperienceLevel } from "../../../constants/enum";

export class UpdateJobDto {
  @IsOptional()
  @IsString({ message: "Job title must be a string." })
  @Length(2, 150, {
    message: "Job title must be between 2 and 150 characters.",
  })
  title?: string;

  @IsOptional()
  @IsString({ message: "Job description must be a string." })
  description?: string;

  @IsOptional()
  @IsString({ message: "Requirements must be a string." })
  requirements?: string;

  @IsOptional()
  @IsNumber({}, { message: "Minimum salary must be a number." })
  salaryMin?: number;

  @IsOptional()
  @IsNumber({}, { message: "Maximum salary must be a number." })
  salaryMax?: number;

  @IsOptional()
  @IsEnum(EmploymentType, {
    message:
      "Employment type must be one of: full-time, part-time, contract, internship, freelance.",
  })
  employmentType?: EmploymentType;

  @IsOptional()
  @IsEnum(ExperienceLevel, {
    message:
      "Experience level must be one of: entry-level, mid-level, senior-level.",
  })
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsUUID("4", { message: "Category ID must be a valid UUID." })
  categoryId?: string;

  @IsOptional()
  @IsArray({ message: "Skills must be an array." })
  @ArrayUnique({ message: "Duplicate skill IDs are not allowed." })
  @IsUUID("4", { each: true, message: "Each skill ID must be a valid UUID." })
  skillIds?: string[];

  @IsOptional()
  @IsArray({ message: "Locations must be an array." })
  @ArrayUnique({ message: "Duplicate location IDs are not allowed." })
  @IsUUID("4", {
    each: true,
    message: "Each location ID must be a valid UUID.",
  })
  locationIds?: string[];
}
