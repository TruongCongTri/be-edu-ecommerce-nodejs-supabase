import { Expose } from "class-transformer";

export class LoginOutputDto {
  @Expose()
  token!: string;

  constructor(partial: Partial<LoginOutputDto>) {
    Object.assign(this, partial);
  }

  static fromData(token: string): LoginOutputDto {
    return new LoginOutputDto({ token });
  }
}