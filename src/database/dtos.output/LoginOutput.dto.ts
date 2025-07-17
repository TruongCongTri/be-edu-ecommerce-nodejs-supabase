import { Expose, Type } from "class-transformer";
import { UserDto } from "../dtos/user.dto";

export class LoginOutputDto {
  @Expose()
  token!: string;

  @Expose()
  @Type(() => UserDto)
  user!: UserDto;

  constructor(partial: Partial<LoginOutputDto>) {
    Object.assign(this, partial);
  }

  static fromData(token: string, user: UserDto): LoginOutputDto {
    return new LoginOutputDto({ token, user });
  }
}
