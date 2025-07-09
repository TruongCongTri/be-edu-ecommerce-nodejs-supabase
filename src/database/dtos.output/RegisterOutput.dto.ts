import { Expose } from "class-transformer";
import { User } from "../entities/User";
import { UserRole } from "../../../constants/enum";

export class RegisterOutputDto {
  @Expose()
  fullName!: string;
  @Expose()
  email!: string;
  @Expose()
  role!: UserRole;

  constructor(partial: Partial<RegisterOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(user: User): RegisterOutputDto {
    return new RegisterOutputDto({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  }
}
