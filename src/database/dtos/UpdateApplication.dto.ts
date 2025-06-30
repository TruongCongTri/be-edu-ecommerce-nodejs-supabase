// src/database/dtos/UpdateApplication.dto.ts
import { IsEnum } from "class-validator";
import { ApplicationStatus } from "../../database/entities/Application";

export class UpdateApplicationDto {
  @IsEnum(ApplicationStatus, {
    message: "Status must be one of: pending, reviewed, accepted, rejected, interview.",
  })
  status!: ApplicationStatus;
}
