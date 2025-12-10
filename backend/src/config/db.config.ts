import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [path.resolve(__dirname, "../entities/*{.ts,.js}")],
  synchronize: true,
});

const dbConnection = AppDataSource.initialize()
  .then(() => {
    console.log("Database is connected sucessfully");
  })
  .catch((error) => {
    console.log("Database connection failed ");
    console.log(error);
  });

export default dbConnection;
