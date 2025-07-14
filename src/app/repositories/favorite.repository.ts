import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { Favorite } from "../../database/entities/Favorite";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const favoriteRepository: Repository<Favorite> =
  AppDataSource.getRepository(Favorite);
export type FavoriteRepositoryType = Repository<Favorite>;
