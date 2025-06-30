import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { User } from "../../database/entities/User";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const authRepository: Repository<User> =
  AppDataSource.getRepository(User);
