import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Situation } from "./entities/Situation";

dotenv.config();

const dialect = process.env.DB_DIALECT;

export const AppDataSource = new DataSource({
  type: dialect as "mysql" | "mariadb" | "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: [Situation],
  subscribers: [],
  migrations: [__dirname + "/migrations/*.js"],
});

export async function initializeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    return;
  }

  await AppDataSource.initialize();
  console.log("Conexão do banco de dados realizada com sucesso!");
}
