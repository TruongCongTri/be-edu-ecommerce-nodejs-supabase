import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Application } from "../../database/entities/Application";

export const applicationRepository: Repository<Application> =
  AppDataSource.getRepository(Application);
