// src/database/dtos/CreateSkill.dto.ts
import { IsString, Length } from "class-validator";

export class CreateSkillDto {
  @IsString({ message: "Skill name must be a string." })
  @Length(2, 100, {
    message: "Skill name must be between 2 and 100 characters.",
  })
  name!: string;
}
