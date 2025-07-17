import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { EducatorDetail } from "../../database/entities/EducatorDetail";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const educatorRepository: Repository<EducatorDetail> =
  AppDataSource.getRepository(EducatorDetail);
export type EducatorRepositoryType = Repository<EducatorDetail>;
