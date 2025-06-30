import { Expose, Type } from "class-transformer";
import { BaseProfileOutputDto } from "./BaseProfileOutput.dto";
import { SkillOutputDto } from "./SkillOutput.dto"; // create this dto for basic skill info
import { JobSeeker } from "../entities/JobSeeker";

export class JobSeekerProfileOutputDto extends BaseProfileOutputDto {
  @Expose()
  resumeUrl!: string | null;

  @Expose()
  experienceYears!: number | null;

  @Expose()
  desiredSalary!: number | null;

  @Expose()
  @Type(() => SkillOutputDto)
  skills!: SkillOutputDto[];

  constructor(partial: Partial<JobSeekerProfileOutputDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  static fromEntity(jobSeeker: JobSeeker): JobSeekerProfileOutputDto {
    return new JobSeekerProfileOutputDto({
      id: jobSeeker.user.id,
      fullName: jobSeeker.user.fullName,
      email: jobSeeker.user.email,
      role: jobSeeker.user.role,
      address: jobSeeker.user.address,
      resumeUrl: jobSeeker.resumeUrl ?? null,
      experienceYears: jobSeeker.experienceYears ?? null,
      desiredSalary: jobSeeker.desiredSalary ?? null,
      skills: jobSeeker.skills?.map(SkillOutputDto.fromEntity),
    });
  }
}
