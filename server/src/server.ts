import "reflect-metadata";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mainRouter from "./routes/mainRoute";
import AppDataSource from "./config/db.config";
import { setupSocketIO } from "./config/socket.config";
import { UserEntity } from "./entities/user.entity";
import { scheduleBookingAutoCancellation } from "./scheduler/bookingAutoCancel.scheduler";

const startServer = async () => {
  try {
    const app = express();
    const httpServer = createServer(app);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5175",
      "http://127.0.0.1:5175",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean) as string[];

    // Initialize Socket.IO
    const io = new Server(httpServer, {
      transports: ["websocket", "polling"],
      cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST"],
      },
      allowEIO3: true,
    });
    
    console.log("🔌 Socket.IO initialized with transports:", ["websocket", "polling"]);
    console.log("✅ Allowed origins:", allowedOrigins);

    // Setup Socket.IO handlers
    setupSocketIO(io);

    app.use(cookieParser());

    // Parse JSON and URL-encoded data with increased limits for file uploads
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      })
    );

    app.use(mainRouter);

    await AppDataSource.initialize();
    console.log("Database initialized");

    // Reset online flags on startup to avoid stale "active" status when no socket is connected
    await AppDataSource.createQueryBuilder()
      .update(UserEntity)
      .set({ isOnline: false, lastSeen: new Date() })
      .execute();

    scheduleBookingAutoCancellation();

    const port = process.env.PORT || 8080;
    httpServer.listen(port, () =>
      console.log(`Server listening on port ${port}`)
    );
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

startServer();
