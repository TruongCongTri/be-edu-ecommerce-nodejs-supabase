import { Expose } from "class-transformer";
import { User } from "../entities/User";

export class RegisterOutputDto {
  @Expose()
  fullName!: string;
  @Expose()
  email!: string;
  @Expose()
  role!: string;

  constructor(partial: Partial<RegisterOutputDto>) {
    Object.assign(this, partial);
  }

  static fromData(register: User): RegisterOutputDto {
    return new RegisterOutputDto({
      fullName: register.fullName,
      email: register.email,
      role: register.role,
    });
  }
}
