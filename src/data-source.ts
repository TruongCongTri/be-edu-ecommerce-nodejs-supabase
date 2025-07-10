import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
// import { Job } from "./database/entities/Job";

console.log("🌐 Connecting to:", process.env.SUPABASE_CONNECTION);
export const AppDataSource = new DataSource({
  type: "postgres",
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  // username: process.env.DB_USERNAME,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  url: process.env.SUPABASE_CONNECTION,
  synchronize: false,
  logging: false,
  ssl: { rejectUnauthorized: false },
  // entities: [Job],
  entities: ["src/database/entities/**/*.ts"],
  subscribers: [],
  migrations: ["src/database/migration/**/*.ts"],
  // migrations: ["src/database/migration/**/1750271319307-AddRelationsToJobsTable.ts"],
  // migrations: ["src/database/migration/**/1750270162064-AddRelationsToEmployersTable.ts"],
});

// ENTITIES: KHÔNG DÙNG ĐỂ DEFINE DATABASE CHỈ DÙNG ĐỂ ĐẠI DIỆN CHO 1 TABLE ĐỂ SỬ DỤNG ORM
// MIGRATIONS: ĐỒNG NHẤT DATABASE, TRÁNH VIỆC UPDATE DATABASE KHÔNG ĐỒNG NHẤT.
