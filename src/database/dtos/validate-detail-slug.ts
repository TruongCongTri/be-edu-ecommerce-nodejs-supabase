import { IsString, Matches } from "class-validator";

export class ValidateDetailSlugDto {
  @IsString({ message: "DetailSlug must be a string." })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Invalid detailSlug format. Use lowercase letters, numbers, and hyphens only.",
  })
  detailSlug!: string;
}
