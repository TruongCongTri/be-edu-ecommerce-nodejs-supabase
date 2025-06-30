// src/database/dtos/UpdateUser.dto.ts
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "Full name must be a string." })
  @Length(2, 50, { message: "Full name must be between 2 and 50 characters." })
  fullName?: string;

  @IsOptional()
  @IsString({ message: "Phone number must be a string." })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: "Address must be a string." })
  address?: string;
}
