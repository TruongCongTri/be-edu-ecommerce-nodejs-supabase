import { IsString } from "class-validator";

export class ValidateCodeDto {
  @IsString({ message: "Code must be a string." })
  code!: string;
}
