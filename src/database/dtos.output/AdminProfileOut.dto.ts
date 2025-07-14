import { BaseProfileOutputDto } from "./BaseProfileOutput.dto";
import { User } from "../entities/User";

export class AdminProfileOutputDto extends BaseProfileOutputDto {
  constructor(partial: Partial<AdminProfileOutputDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  static fromEntity(user: User): AdminProfileOutputDto {
    return new AdminProfileOutputDto({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  }
}
