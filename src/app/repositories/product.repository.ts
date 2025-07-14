import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { Product } from "../../database/entities/Product";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const productRepository: Repository<Product> =
  AppDataSource.getRepository(Product);
export type ProductRepositoryType = Repository<Product>;
