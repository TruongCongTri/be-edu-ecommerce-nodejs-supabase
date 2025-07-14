import { Expose } from "class-transformer";
import { AllowedOrigin } from "../entities/AllowedOrigin";

export class AllowedOriginDto {
  @Expose()
  id!: string;

  @Expose()
  origin!: string;

  @Expose()
  createdAt!: Date;
  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<AllowedOriginDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(allowedOrigin: AllowedOrigin): AllowedOriginDto {
    return new AllowedOriginDto({
      id: allowedOrigin.id,
      origin: allowedOrigin.origin,
      createdAt: allowedOrigin.createdAt,
      updatedAt: allowedOrigin.updatedAt,
    });
  }
}
