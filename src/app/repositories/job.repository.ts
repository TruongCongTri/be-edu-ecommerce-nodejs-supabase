import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Job } from "../../database/entities/Job";

export const jobRepository: Repository<Job> = AppDataSource.getRepository(Job);

export type JobRepositoryType = Repository<Job>;