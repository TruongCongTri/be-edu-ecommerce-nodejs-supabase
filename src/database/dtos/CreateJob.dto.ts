// src/database/dtos/CreateJob.dto.ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  Length,
} from "class-validator";
import { Transform } from "class-transformer";
import { EmploymentType, ExperienceLevel } from "../../../constants/enum";

export class CreateJobDto {
  @IsString({ message: "Job title must be a string." })
  @Length(2, 150, {
    message: "Job title must be between 2 and 150 characters.",
  })
  title!: string;

  @IsString({ message: "Job description is required." })
  description!: string;

  @IsOptional()
  @IsString({ message: "Requirements must be a string." })
  requirements?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: "Minimum salary must be a number." })
  salaryMin?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: "Maximum salary must be a number." })
  salaryMax?: number;

  @IsEnum(EmploymentType, {
    message:
      "Employment type must be one of: full-time, part-time, contract, internship, freelance.",
  })
  employmentType!: EmploymentType;

  @IsEnum(ExperienceLevel, {
    message:
      "Experience level must be one of: entry-level, mid-level, senior-level.",
  })
  experienceLevel!: ExperienceLevel;

  @IsUUID("4", { message: "Category ID must be a valid UUID." })
  categoryId!: string;

  @IsArray({ message: "Skills must be an array." })
  @ArrayNotEmpty({ message: "At least one skill is required." })
  @ArrayUnique({ message: "Duplicate skill IDs are not allowed." })
  @IsUUID("4", { each: true, message: "Each skill ID must be a valid UUID." })
  skillIds!: string[];

  @IsArray({ message: "Locations must be an array." })
  @ArrayNotEmpty({ message: "At least one location is required." })
  @ArrayUnique({ message: "Duplicate location IDs are not allowed." })
  @IsUUID("4", {
    each: true,
    message: "Each location ID must be a valid UUID.",
  })
  locationIds!: string[];
}
