import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  // url: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false },

  entities: ["src/database/entities/**/*.ts"],
  subscribers: [],
  migrations: ["src/database/migration/**/*.ts"],
});

// ENTITIES: KHÔNG DÙNG ĐỂ DEFINE DATABASE CHỈ DÙNG ĐỂ ĐẠI DIỆN CHO 1 TABLE ĐỂ SỬ DỤNG ORM
// MIGRATIONS: ĐỒNG NHẤT DATABASE, TRÁNH VIỆC UPDATE DATABASE KHÔNG ĐỒNG NHẤT.
