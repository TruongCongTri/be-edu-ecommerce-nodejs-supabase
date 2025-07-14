import { IsUUID, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateProductDetailDto {
  @IsUUID()
  productId!: string;

  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  content!: string;

  @IsOptional()
  videoUrl?: string;

  @IsInt()
  @Min(1)
  order!: number;

  @IsOptional()
  isFreePreview?: boolean;
}
