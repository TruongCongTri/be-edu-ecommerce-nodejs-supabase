// src/database/dtos/CreateUser.dto.ts
import { IsEmail, IsEnum, IsOptional, IsString, Length } from "class-validator";
import { UserRole } from "../../../constants/enum";

export class CreateUserDto {
  @IsString({ message: "Full name must be a string." })
  @Length(2, 50, { message: "Full name must be between 2 and 50 characters." })
  fullName!: string;

  @IsEmail({}, { message: "Invalid email format." })
  email!: string;

  @IsString({ message: "Password must be a string." })
  @Length(6, 32, { message: "Password must be between 6 and 32 characters." })
  password!: string;

  @IsOptional()
  @IsString({ message: "Phone number must be a string." })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: "Address must be a string." })
  address?: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message: "Role must be one of: job_seeker, employer, or admin.",
  })
  role?: UserRole;
}
