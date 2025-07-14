import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateAllowedOriginDto {
  @IsNotEmpty()
  origin!: string;
}
