// src/database/dtos/CreateJobSeeker.dto.ts

import { IsOptional, IsUrl, IsInt, Min, Max, IsNumber } from "class-validator";

export class CreateJobSeekerDto {
  @IsOptional()
  @IsUrl({}, { message: "Resume URL must be a valid URL." })
  resumeUrl?: string;

  @IsOptional()
  @IsInt({ message: "Experience years must be an integer." })
  @Min(0, { message: "Experience years cannot be negative." })
  @Max(50, { message: "Experience years is too high." })
  experienceYears?: number;

  @IsOptional()
  @IsNumber({}, { message: "Desired salary must be a number." })
  desiredSalary?: number;
}
