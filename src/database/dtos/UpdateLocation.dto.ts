// src/database/dtos/UpdateLocation.dto.ts
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateLocationDto {
  @IsOptional()
  @IsString({ message: "Location name must be a string." })
  @Length(2, 100, {
    message: "Location name must be between 2 and 100 characters.",
  })
  name?: string;

  @IsOptional()
  @IsString({ message: "Location code must be a string." })
  @Length(2, 20, {
    message: "Location code must be between 2 and 20 characters.",
  })
  code?: string;
}
