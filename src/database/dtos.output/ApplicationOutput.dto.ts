import { Expose, Type } from "class-transformer";
import { Application } from "../entities/Application";
import { ApplicationStatus } from "../entities/Application";
import { JobPartialOutputDto } from "./JobPartialOutput.dto"; // basic job info
import { JobSeekerProfileOutputDto } from "./JobSeekerProfileOutput.dto"; // or just base info
import { EmployerProfileOutputDto } from "./EmployerProfileOutput.dto";

export class ApplicationOutputDto {
  @Expose()
  id!: string;

  @Expose()
  coverLetter?: string;

  @Expose()
  status!: ApplicationStatus;

  @Expose()
  appliedAt!: Date;

  @Expose()
  @Type(() => JobPartialOutputDto)
  job!: JobPartialOutputDto;

  @Expose()
  @Type(() => JobSeekerProfileOutputDto)
  jobSeeker!: JobSeekerProfileOutputDto;

  constructor(partial: Partial<ApplicationOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(app: Application): ApplicationOutputDto {
    return new ApplicationOutputDto({
      id: app.id,
      coverLetter: app.coverLetter,
      status: app.status,
      appliedAt: app.appliedAt,
      job: JobPartialOutputDto.fromEntity(app.job),
      jobSeeker: JobSeekerProfileOutputDto.fromEntity(app.jobSeeker),
    });
  }
}
