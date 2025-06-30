import { IsOptional, IsString, IsUrl, IsArray } from "class-validator";

export class UpdateJobSeekerProfileDto {
  @IsOptional()
  @IsUrl({}, { message: "Resume URL must be valid." })
  resumeUrl?: string;

  @IsOptional()
  @IsArray({ message: "Skills must be an array of skill IDs." })
  @IsString({ each: true, message: "Each skill ID must be a string." })
  skillIds?: string[];
}
