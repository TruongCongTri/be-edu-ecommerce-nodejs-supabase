import { Expose, Type } from "class-transformer";
import { ViewHistory } from "../entities/ViewHistory";
import { UserDto } from "./user.dto";
import { ProductDto } from "./product.dto";

export class ViewHistoryDto {
  @Expose()
  id!: string;

  @Expose()
  @Type(() => UserDto)
  user!: UserDto;

  @Expose()
  @Type(() => ProductDto)
  product!: ProductDto;

  @Expose()
  viewedAt!: Date;

  constructor(partial: Partial<ViewHistoryDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(history: ViewHistory): ViewHistoryDto {
    return new ViewHistoryDto({
      id: history.id,
      user: history.user,
      product: history.product,
      viewedAt: history.viewedAt,
    });
  }
}
