// src/database/dtos/CreateEmployer.dto.ts
import { IsOptional, IsString, Length, IsUrl } from "class-validator";

export class CreateEmployerDto {
  @IsString({ message: "Company name must be a string." })
  @Length(2, 100, {
    message: "Company name must be between 2 and 100 characters.",
  })
  companyName!: string;

  @IsOptional()
  @IsString({ message: "Company description must be a string." })
  companyDescription?: string;

  @IsOptional()
  @IsUrl({}, { message: "Company website must be a valid URL." })
  companyWebsite?: string;

  @IsOptional()
  @IsUrl({}, { message: "Company logo URL must be a valid URL." })
  companyLogoUrl?: string;
}
