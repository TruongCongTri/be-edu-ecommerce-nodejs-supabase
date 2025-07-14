import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { Skill } from "../../database/entities/Skill";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const skillRepository: Repository<Skill> =
  AppDataSource.getRepository(Skill);
export type SkillRepositoryType = Repository<Skill>;
