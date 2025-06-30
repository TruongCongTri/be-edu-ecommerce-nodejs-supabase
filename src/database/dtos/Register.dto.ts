import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class RegisterDto {
  @IsString({ message: "Full name must be a string." })
  @Length(2, 50, { message: "Full name must be between 2 and 50 characters." })
  fullName!: string;

  @IsEmail({}, { message: "Email must be a valid format." })
  email!: string;

  @IsString({ message: "Password must be a string." })
  @Length(6, 32, { message: "Password must be between 6 and 32 characters." })
  password!: string;

  @IsOptional()
  @IsString({ message: "Phone number must be a string." })
  phoneNumber?: string;
}
