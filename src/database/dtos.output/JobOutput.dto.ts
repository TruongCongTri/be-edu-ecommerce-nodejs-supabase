import { Exclude, Expose, Transform, Type } from "class-transformer";
import { Job } from "../entities/Job";

import { CategoryOutputDto } from "./CategoryOutput.dto";
import { SkillOutputDto } from "./SkillOutput.dto";
import { LocationOutputDto } from "./LocationOutput.dto";
import { EmployerOutputDto } from "./EmployerOutput.dto";

export class JobOutputDto {
  @Expose()
  id!: string;

  @Expose()
  slug!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string;

  @Expose()
  requirements?: string;

  @Expose()
  salaryMin?: number;

  @Expose()
  salaryMax?: number;

  @Expose()
  employmentType!: string;

  @Expose()
  experienceLevel!: string;

  @Expose()
  isActive!: boolean;

  // @Expose()
  // @Transform(({ value }) => value.toISOString())
  // postedAt!: string;
  // @Expose()
  // @Transform(({ value }) => value?.toISOString() ?? null)
  // expiresAt?: string;
  @Expose()
  postedAt!: Date;
  @Expose()
  expiresAt?: Date;


  @Expose()
  @Type(() => CategoryOutputDto)
  category!: CategoryOutputDto;

  @Expose()
  @Type(() => SkillOutputDto)
  skills!: SkillOutputDto[];

  @Expose()
  @Type(() => LocationOutputDto)
  locations!: LocationOutputDto[];

  @Expose()
  @Type(() => EmployerOutputDto)
  employer!: EmployerOutputDto;

  constructor(partial: Partial<JobOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(job: Job): JobOutputDto {
    return new JobOutputDto({
      id: job.id,
      slug: job.slug,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      postedAt: job.postedAt,
      isActive: job.isActive,
      category: CategoryOutputDto.fromEntity(job.category),
      skills: job.skills.map(SkillOutputDto.fromEntity),
      locations: job.locations.map(LocationOutputDto.fromEntity),
      employer: EmployerOutputDto.fromEntity(job.employer),
    });
  }
}
