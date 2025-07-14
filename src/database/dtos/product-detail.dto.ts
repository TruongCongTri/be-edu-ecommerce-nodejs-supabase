import { Expose, Type } from "class-transformer";
import { ProductDetail } from "../entities/ProductDetail";
import { UserDto } from "./user.dto";
import { ProductDto } from "./product.dto";

export class ProductDetailDto {
  @Expose()
  id!: string;

  @Expose()
  slug!: string;

  @Expose()
  @Type(() => ProductDto)
  product!: ProductDto;

  @Expose()
  title!: string;

  @Expose()
  content!: string;

  @Expose()
  videoUrl?: string;

  @Expose()
  order!: number;

  @Expose()
  isFreePreview!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  @Type(() => UserDto)
  educator?: UserDto;

  constructor(partial: Partial<ProductDetailDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(prod: ProductDetail): ProductDetailDto {
    return new ProductDetailDto({
      id: prod.id,
      slug: prod.slug,
      title: prod.title,
      content: prod.content,
      videoUrl: prod.videoUrl,
      order: prod.order,
      isFreePreview: prod.isFreePreview,
      product: prod.product,
      createdAt: prod.createdAt,
      educator: prod.educator,
    });
  }
}
