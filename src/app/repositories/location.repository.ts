import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Location } from "../../database/entities/Location";

export const locationRepository: Repository<Location> =
  AppDataSource.getRepository(Location);
