// src/database/dtos/UpdateJobSeeker.dto.ts
import { Transform } from "class-transformer";
import {
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsArray,
  IsString,
  Length,
} from "class-validator";

export class UpdateJobSeekerDto {
  @IsOptional()
  @IsString({ message: "Full Name must be a string." })
  @Length(2, 20, {
    message: "Full Name must be between 2 and 20 characters.",
  })
  fullName?: string;
  
  @IsOptional()
  @IsString({ message: "Address must be a string." })
  @Length(2, 150, {
    message: "Address must be between 2 and 150 characters.",
  })
  address?: string;

  @IsOptional()
  @IsUrl({}, { message: "Resume URL must be a valid URL." })
  resumeUrl?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: "Experience years must be an integer." })
  @Min(0, { message: "Experience years cannot be negative." })
  @Max(50, { message: "Experience years is too high." })
  experienceYears?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: "Desired salary must be a number." })
  desiredSalary?: number;

  @IsOptional()
  @IsArray({ message: "Skills must be an array of skill IDs." })
  @IsString({ each: true, message: "Each skill ID must be a string." })
  skillIds?: string[];
}
