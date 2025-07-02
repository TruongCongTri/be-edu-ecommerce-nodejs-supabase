import { Expose } from "class-transformer";
import { BaseProfileOutputDto } from "./BaseProfileOutput.dto";
import { Employer } from "../entities/Employer";

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

  static fromEntity(employer: Employer): EmployerProfileOutputDto {
    return new EmployerProfileOutputDto({
      id: employer.user.id,
      fullName: employer.user.fullName,
      email: employer.user.email,
      role: employer.user.role,
      address: employer.user.address ?? null,
      companyName: employer.companyName,
      slug: employer.slug,
      companyWebsite: employer.companyWebsite ?? null,
      companyDescription: employer.companyDescription ?? null,
      companyLogoUrl: employer.companyLogoUrl ?? null,
    });
  }
}
