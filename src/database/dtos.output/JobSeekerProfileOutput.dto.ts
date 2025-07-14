import { Expose, Type } from "class-transformer";
import { BaseProfileOutputDto } from "./BaseProfileOutput.dto";
import { SkillOutputDto } from "./SkillOutput.dto"; // create this dto for basic skill info
import { StudentDetail } from "../entities/StudentDetail";

export class JobSeekerProfileOutputDto extends BaseProfileOutputDto {

  constructor(partial: Partial<JobSeekerProfileOutputDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  static fromEntity(jobSeeker: StudentDetail): JobSeekerProfileOutputDto {
    return new JobSeekerProfileOutputDto({
      id: jobSeeker.user.id,
      fullName: jobSeeker.user.fullName,
      email: jobSeeker.user.email,
      role: jobSeeker.user.role,
    });
  }
}
