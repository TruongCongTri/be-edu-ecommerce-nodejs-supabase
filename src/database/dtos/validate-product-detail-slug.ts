import { IsString, Matches } from "class-validator";

export class ValidateProductAndDetailSlugDto {
  @IsString({ message: "ProductSlug must be a string." })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Invalid productSlug format. Use lowercase letters, numbers, and hyphens only.",
  })
  productSlug!: string;

  @IsString({ message: "DetailSlug must be a string." })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Invalid detailSlug format. Use lowercase letters, numbers, and hyphens only.",
  })
  detailSlug!: string;
}
