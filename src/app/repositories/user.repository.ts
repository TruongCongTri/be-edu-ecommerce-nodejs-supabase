import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { User } from "../../database/entities/User";
import { Employer } from "../../database/entities/Employer";
import { JobSeeker } from "../../database/entities/JobSeeker";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const userRepository: Repository<User> =
  AppDataSource.getRepository(User);
export type UserRepositoryType = Repository<User>;

export const employerRepository: Repository<Employer> =
  AppDataSource.getRepository(Employer);
export type EmployerRepositoryType = Repository<Employer>;

export const jobSeekerRepository: Repository<JobSeeker> =
  AppDataSource.getRepository(JobSeeker);
export type JobSeekerRepositoryType = Repository<JobSeeker>;
