import { IsString, Length } from "class-validator";

export class ChangePasswordDto {
  @IsString({ message: "Current password must be a string." })
  @Length(6, 32, {
    message: "Current password must be between 6 and 32 characters.",
  })
  currentPassword!: string;

  @IsString({ message: "New password must be a string." })
  @Length(6, 32, {
    message: "New password must be between 6 and 32 characters.",
  })
  newPassword!: string;
}
