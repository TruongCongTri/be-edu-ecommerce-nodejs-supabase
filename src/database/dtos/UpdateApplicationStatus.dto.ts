import { IsEnum } from "class-validator";
import { ApplicationStatus } from "../entities/Application";

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus, {
    message: "Invalid application status.",
  })
  status!: ApplicationStatus;
}
