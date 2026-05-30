"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata"); // optional here, but safe
const typeorm_1 = require("typeorm");
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [__dirname + "/../entities/*{.ts,.js}"],
    migrationsRun: true,
});
exports.default = AppDataSource;
