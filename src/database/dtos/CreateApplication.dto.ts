// src/database/dtos/CreateApplication.dto.ts
import { IsOptional, IsString, IsUUID, Length } from "class-validator";

export class CreateApplicationDto {
  @IsUUID("4", { message: "Job ID must be a valid UUID." })
  jobId!: string;

  @IsOptional()
  @IsString({ message: "Cover letter must be a string." })
  @Length(10, 2000, {
    message: "Cover letter must be between 10 and 2000 characters.",
  })
  coverLetter?: string;
}
