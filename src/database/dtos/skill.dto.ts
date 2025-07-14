import { Expose } from "class-transformer";
import { Skill } from "../entities/Skill";
import { Product } from "../entities/Product";

export class SkillDto {
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

  @Expose()
  products?: Product[];

  constructor(partial: Partial<SkillDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(skill: Skill): SkillDto {
    return new SkillDto({
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
      products: skill.products,
    });
  }
}
