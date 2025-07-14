import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { User } from "../../database/entities/User";
import { EducatorDetail } from "../../database/entities/EducatorDetail";
import { StudentDetail } from "../../database/entities/StudentDetail";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const userRepository: Repository<User> =
  AppDataSource.getRepository(User);
export type UserRepositoryType = Repository<User>;

export const educatorRepository: Repository<EducatorDetail> =
  AppDataSource.getRepository(EducatorDetail);
export type EducatorRepositoryType = Repository<EducatorDetail>;

export const studentRepository: Repository<StudentDetail> =
  AppDataSource.getRepository(StudentDetail);
export type StudentRepositoryType = Repository<StudentDetail>;
