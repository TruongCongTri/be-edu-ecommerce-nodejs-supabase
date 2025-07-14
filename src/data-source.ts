import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";

export const AppDataSource = new DataSource({
  type: "postgres",

  // Step 1. un-comment 5 lines below to use local postgresql database 
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  // username: process.env.DB_USERNAME,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,

  // Step 2. comment 2 lines below to use local postgresql database  
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },

  synchronize: false,
  logging: false,

  entities: ["src/database/entities/**/*.ts"],
  subscribers: [],
  migrations: ["src/database/migration/**/*.ts"],
});
