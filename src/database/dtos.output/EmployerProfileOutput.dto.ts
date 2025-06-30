import { Expose } from "class-transformer";
import { BaseProfileOutputDto } from "./BaseProfileOutput.dto";
import { Employer } from "../entities/Employer";

export class EmployerProfileOutputDto extends BaseProfileOutputDto {
  @Expose()
  companyName!: string;

  @Expose()
  slug!: string;

  @Expose()
  companyWebsite?: string;

  @Expose()
  companyDescription?: string;

  @Expose()
  companyLogoUrl?: string;

  constructor(partial: Partial<EmployerProfileOutputDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  static fromEntity(employer: Employer): EmployerProfileOutputDto {
    return new EmployerProfileOutputDto({
      id: employer.user.id,
      fullName: employer.user.fullName,
      email: employer.user.email,
      role: employer.user.role,
      companyName: employer.companyName,
      slug: employer.slug,
      companyWebsite: employer.companyWebsite,
      companyDescription: employer.companyDescription,
      companyLogoUrl: employer.companyLogoUrl,
    });
  }
}
