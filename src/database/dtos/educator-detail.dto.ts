import { Expose } from "class-transformer";
import { EducatorDetail } from "../entities/EducatorDetail";

export class EducatorDetailDto {
  @Expose()
  id!: string;

  @Expose()
  userId!: string;

  @Expose()
  bio?: string;

  @Expose()
  expertise?: string;

  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<EducatorDetailDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(educator: EducatorDetail): EducatorDetailDto {
    return new EducatorDetailDto({
      id: educator.id,
      userId: educator.user.id,
      bio: educator.bio || "",
      expertise: educator.expertise || "",
    });
  }
}
