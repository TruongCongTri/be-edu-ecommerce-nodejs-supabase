import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateEmployerProfileDto {
  @IsOptional()
  @IsString({ message: "Company description must be a string." })
  companyDescription?: string;

  @IsOptional()
  @IsUrl({}, { message: "Company website must be a valid URL." })
  companyWebsite?: string;

  @IsOptional()
  @IsUrl({}, { message: "Logo URL must be a valid URL." })
  companyLogoUrl?: string;
}
