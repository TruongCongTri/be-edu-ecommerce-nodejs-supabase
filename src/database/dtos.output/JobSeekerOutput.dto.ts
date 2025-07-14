import { Expose, Type } from "class-transformer";
import { JobSeeker } from "../entities/StudentDetail";
import { JobPartialOutputDto } from "./JobPartialOutput.dto";
import { UserOutputDto } from "./UserOutput.dto";
import { SkillOutputDto } from "./SkillOutput.dto";

export class JobSeekerOutputDto {
  @Expose()
  id!: string;
  @Expose()
  userId!: string;

  @Expose()
  resumeUrl?: string;
  @Expose()
  experienceYears?: number;
  @Expose()
  desiredSalary?: number;

  @Expose()
  @Type(() => SkillOutputDto)
  skills!: SkillOutputDto[];

  // @Expose()
  // @Type(() => UserOutputDto)
  // user!: UserOutputDto;

  constructor(partial: Partial<JobSeekerOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(jobSeeker: JobSeeker): JobSeekerOutputDto {
    return new JobSeekerOutputDto({
      id: jobSeeker.id,
      userId: jobSeeker.userId,
      resumeUrl: jobSeeker.resumeUrl,
      experienceYears: jobSeeker.experienceYears,
      desiredSalary: jobSeeker.desiredSalary,
      // user: UserOutputDto.fromEntity(jobSeeker.user),
      skills: jobSeeker.skills.map(SkillOutputDto.fromEntity),
    });
  }
}
