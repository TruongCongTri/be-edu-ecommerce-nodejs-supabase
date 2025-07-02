import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Category } from "../../database/entities/Category";

export const categoryRepository: Repository<Category> =
  AppDataSource.getRepository(Category);
  
export type CategoryRepositoryType = Repository<Category>;