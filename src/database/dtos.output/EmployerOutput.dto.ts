import { Expose, Type } from "class-transformer";
import { Employer } from "../entities/EducatorDetail";
import { UserOutputDto } from "./UserOutput.dto";

export class EmployerOutputDto {
  @Expose()
  id!: string;
  @Expose()
  userId!: string;

  @Expose()
  slug!: string;
  @Expose()
  companyName!: string;
  @Expose()
  companyDescription?: string;
  @Expose()
  companyWebsite?: string;
  @Expose()
  companyLogoUrl?: string;

  // @Expose()
  // @Type(() => UserOutputDto)
  // user?: UserOutputDto;

  constructor(partial: Partial<EmployerOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(employer: Employer): EmployerOutputDto {
    return new EmployerOutputDto({
      id: employer.id,
      userId: employer.userId,
      companyName: employer.companyName,
      slug: employer.slug,
      companyDescription: employer.companyDescription,
      companyWebsite: employer.companyWebsite,
      companyLogoUrl: employer.companyLogoUrl,

      // user: UserOutputDto.fromEntity(employer.user),
    });
  }
}
