import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { ForbiddenWord } from "../../database/entities/ForbiddenWord";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const forbiddenWordRepository: Repository<ForbiddenWord> =
  AppDataSource.getRepository(ForbiddenWord);
export type ForbiddenWordRepositoryType = Repository<ForbiddenWord>;
