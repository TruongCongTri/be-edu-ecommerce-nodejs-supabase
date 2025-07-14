import { IsNotEmpty } from "class-validator";

export class CreateForbiddenWordDto {
  @IsNotEmpty()
  word!: string;
}
