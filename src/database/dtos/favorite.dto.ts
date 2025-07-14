import { Expose, Type } from "class-transformer";
import { Favorite } from "../entities/Favorite";
import { UserDto } from "./user.dto";
import { ProductDto } from "./product.dto";

export class FavoriteDto {
  @Expose()
  id!: string;

  @Expose()
  @Type(() => UserDto)
  user!: UserDto;

  @Expose()
  @Type(() => ProductDto)
  product!: ProductDto;

  @Expose()
  createdAt!: Date;

  constructor(partial: Partial<FavoriteDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(fav: Favorite): FavoriteDto {
    return new FavoriteDto({
      id: fav.id,
      user: fav.user,
      product: fav.product,
      createdAt: fav.createdAt,
    });
  }
}
