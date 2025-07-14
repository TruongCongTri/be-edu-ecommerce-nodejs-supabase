import { Expose } from "class-transformer";
import { Job } from "../entities/Product";

export class JobPartialOutputDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;
  @Expose()
  slug!: string;

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
  postedAt!: Date;
  @Expose()
  expiresAt?: Date;

  @Expose()
  isActive!: boolean;

  constructor(partial: Partial<JobPartialOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(job: Job): JobPartialOutputDto {
    return new JobPartialOutputDto({
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
      expiresAt: job.expiresAt,
      isActive: job.isActive, 
    });
  }
}
