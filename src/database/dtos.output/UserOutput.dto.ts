import { Exclude, Expose } from "class-transformer";
import { User } from "../entities/User";

export class UserOutputDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;
  @Expose()
  email!: string;
  @Exclude() // hide from output
  password!: string;

  @Expose()
  address?: string;
  @Expose()
  role!: string;

  constructor(partial: Partial<UserOutputDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(user: User): UserOutputDto {
    return new UserOutputDto({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      address: user.address,
      role: user.role,
    });
  }
}
