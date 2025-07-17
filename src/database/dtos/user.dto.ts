import { Exclude, Expose } from "class-transformer";
import { User } from "../entities/User";

export class UserDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  fullName!: string;

  @Exclude() // This decorator tells class-transformer to exclude this property
  passwordHash?: string;
  
  @Expose()
  role!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(user: User): UserDto {
    return new UserDto({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  }
}
