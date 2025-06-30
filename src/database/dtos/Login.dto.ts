import { IsEmail, IsString, Length } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Email must be a valid format." })
  email!: string;

  @IsString({ message: "Password must be a string." })
  @Length(6, 32, { message: "Password must be between 6 and 32 characters." })
  password!: string;
}
