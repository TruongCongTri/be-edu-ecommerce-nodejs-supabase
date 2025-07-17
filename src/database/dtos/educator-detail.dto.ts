import { Expose, Type } from "class-transformer";
import { EducatorDetail } from "../entities/EducatorDetail";
import { UserDto } from "./user.dto";

export class EducatorDetailDto {
  @Expose()
  id!: string;

  @Expose()
  @Type(() => UserDto)
  user?: UserDto;

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
      user: educator.user,
      bio: educator.bio || "",
      expertise: educator.expertise || "",
    });
  }
}
