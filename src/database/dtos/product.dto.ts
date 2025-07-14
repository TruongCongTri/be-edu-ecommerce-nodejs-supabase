import { Expose, Type } from "class-transformer";
import { CategoryDto } from "./category.dto";
import { SkillDto } from "./skill.dto";
import { ProductDetailDto } from "./product-detail.dto";
import { UserDto } from "./user.dto";
import { Product } from "../entities/Product";

export class ProductDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  shortDesc!: string;

  @Expose()
  longDesc!: string;

  @Expose()
  imageUrl!: string;

  @Expose()
  price?: number;

  @Expose()
  isActive!: boolean;

  @Expose()
  @Type(() => CategoryDto)
  category?: CategoryDto;

  @Expose()
  @Type(() => UserDto)
  educator?: UserDto;

  @Expose()
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @Expose()
  @Type(() => ProductDetailDto)
  curriculum?: ProductDetailDto[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<ProductDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(prod: Product): ProductDto {
    return new ProductDto({
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      shortDesc: prod.shortDesc,
      longDesc: prod.longDesc,
      imageUrl: prod.imageUrl,
      price: prod.price,
      isActive: prod.isActive,
      category: prod.category,
      skills: prod.skills,
      educator: prod.educator,
      curriculum: prod.curriculum,
      createdAt: prod.createdAt,
    });
  }
}
