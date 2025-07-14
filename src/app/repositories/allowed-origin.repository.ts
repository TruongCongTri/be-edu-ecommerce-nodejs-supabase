import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { AllowedOrigin } from '../../database/entities/AllowedOrigin';

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const allowedOriginRepository: Repository<AllowedOrigin> =
  AppDataSource.getRepository(AllowedOrigin);
export type AllowedOriginRepositoryType = Repository<AllowedOrigin>;
