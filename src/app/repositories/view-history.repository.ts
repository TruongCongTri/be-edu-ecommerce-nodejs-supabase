import { AppDataSource } from "../../data-source";
import { Repository } from "typeorm";
import { ViewHistory } from "../../database/entities/ViewHistory";

//1. tạo lớp interface, kế thừa repository mặc định của tyopeorm
export const viewHistoryRepository: Repository<ViewHistory> =
  AppDataSource.getRepository(ViewHistory);
export type ViewHistoryRepositoryType = Repository<ViewHistory>;
