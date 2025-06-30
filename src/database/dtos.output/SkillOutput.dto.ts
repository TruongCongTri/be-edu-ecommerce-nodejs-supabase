import { Expose, Type } from "class-transformer";
import { Skill } from "../entities/Skill";
import { JobPartialOutputDto } from "./JobPartialOutput.dto";

export class SkillOutputDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  @Type(() => JobPartialOutputDto)
  jobs?: JobPartialOutputDto[];

  constructor(partial: Partial<SkillOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(skill: Skill): SkillOutputDto {
    return new SkillOutputDto({
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      jobs: skill.jobs?.map(JobPartialOutputDto.fromEntity),
    });
  }
}
