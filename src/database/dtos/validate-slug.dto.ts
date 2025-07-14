import { IsString, Matches } from "class-validator";

export class ValidateSlugDto {
  @IsString({ message: "Slug must be a string." })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Invalid slug format. Use lowercase letters, numbers, and hyphens only.",
  })
  slug!: string;
}
