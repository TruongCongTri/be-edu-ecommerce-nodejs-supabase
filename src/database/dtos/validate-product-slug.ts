import { IsString, Matches } from "class-validator";

export class ValidateProductSlugDto {
  @IsString({ message: "ProductSlug must be a string." })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Invalid productSlug format. Use lowercase letters, numbers, and hyphens only.",
  })
  productSlug!: string;
}
