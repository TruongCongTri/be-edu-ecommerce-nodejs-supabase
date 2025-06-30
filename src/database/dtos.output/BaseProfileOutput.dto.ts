import { Expose } from "class-transformer";
import { UserRole } from "../../../constants/enum";

export class BaseProfileOutputDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  email!: string;

  @Expose()
  role!: UserRole;

  @Expose()
  address!: string | null;

  constructor(partial: Partial<BaseProfileOutputDto>) {
    Object.assign(this, partial);
  }
}
