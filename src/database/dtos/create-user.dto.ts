import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { UserRole } from "../../../constants/enum";

export class CreateUserDto {
  @IsEmail({}, { message: "Invalid email format." })
  email!: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString({ message: "Password must be a string." })
  @Length(6, 32, { message: "Password must be between 6 and 32 characters." })
  password!: string;

  @IsOptional()
  @IsString({ message: "Full name must be a string." })
  @Length(2, 50, { message: "Full name must be between 2 and 50 characters." })
  fullName?: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message: "Role must be one of: student, educator, or admin.",
  })
  role?: UserRole;
}
