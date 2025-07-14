import { Expose } from "class-transformer";
import { BaseProfileOutputDto } from "./BaseProfileOutput.dto";
import { EducatorDetail } from "../entities/EducatorDetail";

export class EmployerProfileOutputDto extends BaseProfileOutputDto {
  @Expose()
  companyName!: string;

  @Expose()
  slug!: string;

  @Expose()
  companyWebsite?: string | null; 

  @Expose()
  companyDescription?: string | null; 

  @Expose()
  companyLogoUrl?: string | null; 

  constructor(partial: Partial<EmployerProfileOutputDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  static fromEntity(employer: EducatorDetail): EmployerProfileOutputDto {
    return new EmployerProfileOutputDto({
      id: employer.user.id,
      fullName: employer.user.fullName,
      email: employer.user.email,
      role: employer.user.role,
    });
  }
}
