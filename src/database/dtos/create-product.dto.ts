import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsString,
  Length,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from "class-validator";

export class CreateProductDto {
  @IsString({ message: "Product name must be a string." })
  @Length(2, 150, {
    message: "Product name must be between 2 and 150 characters.",
  })
  name!: string;

  @IsString({ message: "Product short description is required." })
  shortDesc!: string;

  @IsString({ message: "Product long description is required." })
  longDesc!: string;

  @IsNotEmpty({ message: "Product image is required." })
  imageUrl!: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: "Minimum salary must be a number." })
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  categorySlug!: string;

  @IsArray({ message: "Locations must be an array." })
  @ArrayNotEmpty({ message: "At least one location is required." })
  @ArrayUnique({ message: "Duplicate location IDs are not allowed." })
  skillSlugs!: string[];
}
