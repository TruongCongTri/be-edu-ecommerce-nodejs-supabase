import { Expose, Type } from "class-transformer";
import { Category } from "../entities/Category"; // Adjust path as needed
import { JobPartialOutputDto } from "./JobPartialOutput.dto";

export class CategoryOutputDto {
  @Expose()
  id!: string;
  @Expose()
  name!: string;
  @Expose()
  slug!: string;
  @Expose()
  description?: string;

  @Expose()
  @Type(() => JobPartialOutputDto)
  jobs?: JobPartialOutputDto[];

  constructor(partial: Partial<CategoryOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(category: Category): CategoryOutputDto {
    return new CategoryOutputDto({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      jobs: category.jobs?.map(JobPartialOutputDto.fromEntity),
    });
  }
}
