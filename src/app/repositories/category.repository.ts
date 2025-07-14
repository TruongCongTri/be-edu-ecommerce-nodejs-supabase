import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { Category } from "../../database/entities/Category";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const categoryRepository: Repository<Category> =
  AppDataSource.getRepository(Category);
export type CategoryRepositoryType = Repository<Category>;
