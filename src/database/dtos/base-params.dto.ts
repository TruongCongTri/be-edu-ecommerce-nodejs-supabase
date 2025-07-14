import { IsUUID, IsString } from "class-validator";

export class BaseIdParamDto {
  @IsUUID("4", { message: "Invalid ID format. Must be a UUID v4." })
  id!: string;
}

export class BaseSlugParamDto {
  @IsString({ message: "Slug must be a string." })
  slug!: string;
}
