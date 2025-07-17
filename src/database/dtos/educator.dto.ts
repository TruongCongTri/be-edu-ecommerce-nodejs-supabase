import { Expose, Type } from "class-transformer";
import { UserDto } from "./user.dto";
import { EducatorDetailDto } from "./educator-detail.dto";
import { User } from "../entities/User";

export class EducatorDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  email!: string;
  
  @Expose()
  @Type(() => EducatorDetailDto)
  educatorDetail?: EducatorDetailDto;

  static fromEntity(entity: User): EducatorDto {
    const dto = new EducatorDto();
    dto.id = entity.id;
    dto.fullName = entity.fullName;
    dto.email = entity.email;
    dto.educatorDetail = entity.educatorDetail
      ? EducatorDetailDto.fromEntity(entity.educatorDetail)
      : undefined;
    return dto;
  }
}
