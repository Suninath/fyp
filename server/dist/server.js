"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mainRoute_1 = __importDefault(require("./routes/mainRoute"));
const db_config_1 = __importDefault(require("./config/db.config"));
const socket_config_1 = require("./config/socket.config");
const user_entity_1 = require("./entities/user.entity");
const bookingAutoCancel_scheduler_1 = require("./scheduler/bookingAutoCancel.scheduler");
const cancelStalePayments_scheduler_1 = require("./scheduler/cancelStalePayments.scheduler");
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const app = (0, express_1.default)();
        const httpServer = (0, http_1.createServer)(app);
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
        ].filter(Boolean);
        // Initialize Socket.IO
        const io = new socket_io_1.Server(httpServer, {
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
        (0, socket_config_1.setupSocketIO)(io);
        app.use((0, cookie_parser_1.default)());
        // Parse JSON and URL-encoded data with increased limits for file uploads
        app.use(express_1.default.json({ limit: "50mb" }));
        app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
        app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        }));
        app.use(mainRoute_1.default);
        yield db_config_1.default.initialize();
        console.log("Database initialized");
        // Reset online flags on startup to avoid stale "active" status when no socket is connected
        yield db_config_1.default.createQueryBuilder()
            .update(user_entity_1.UserEntity)
            .set({ isOnline: false, lastSeen: new Date() })
            .execute();
        (0, bookingAutoCancel_scheduler_1.scheduleBookingAutoCancellation)();
        (0, cancelStalePayments_scheduler_1.scheduleCancelStalePayments)();
        const port = process.env.PORT || 8080;
        httpServer.listen(port, () => console.log(`Server listening on port ${port}`));
    }
    catch (error) {
        console.error("Startup failed:", error);
        process.exit(1);
    }
});
startServer();
