import { Expose } from "class-transformer";
import { Category } from "../entities/Category";

export class CategoryDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  description?: string;

  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<CategoryDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(skill: Category): CategoryDto {
    return new CategoryDto({
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
    });
  }
}
