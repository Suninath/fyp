import "reflect-metadata";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import mainRouter from "./routes/mainRoute";
import AppDataSource from "./config/db.config";

const startServer = async () => {
  try {
    const app = express();

    app.use(cookieParser());

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      })
    );

    app.use(mainRouter);

    await AppDataSource.initialize();
    console.log("Database initialized");

    const port = process.env.PORT || 8080;
    app.listen(port, () =>
      console.log(`Server listening on port ${port}`)
    );
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

startServer();
