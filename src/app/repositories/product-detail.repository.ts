import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { ProductDetail } from "../../database/entities/ProductDetail";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const productDetailRepository: Repository<ProductDetail> =
  AppDataSource.getRepository(ProductDetail);
export type ProductDetailRepositoryType = Repository<ProductDetail>;
