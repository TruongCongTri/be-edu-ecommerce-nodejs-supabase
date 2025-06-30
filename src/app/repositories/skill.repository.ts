import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Skill } from "../../database/entities/Skill";

export const skillRepository: Repository<Skill> =
  AppDataSource.getRepository(Skill);
