"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const auth_entity_1 = require("./entities/auth.entity");
const user_entity_1 = require("./entities/user.entity");
const enums_1 = require("./constant/enums");
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "second_auto_gear",
    synchronize: false,
    logging: false,
    entities: [__dirname + "/entities/*{.ts,.js}"],
});
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt.hash(password, 10);
    });
}
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield AppDataSource.initialize();
            console.log("Database connected");
            const userRepo = AppDataSource.getRepository(user_entity_1.UserEntity);
            const authRepo = AppDataSource.getRepository(auth_entity_1.AuthEntity);
            /* ===================== ADMIN ===================== */
            const adminUser = userRepo.create({
                name: "System Administrator",
                phoneNumber: "9841234567",
            });
            yield userRepo.save(adminUser);
            const adminAuth = authRepo.create({
                email: "admin@autogear.com",
                password: yield hashPassword("admin123"),
                role: enums_1.USER_ROLE.ADMIN,
                user: adminUser,
            });
            yield authRepo.save(adminAuth);
            console.log("Admin seeded");
            /* ===================== USERS ===================== */
            const users = [
                {
                    email: "john.doe@example.com",
                    name: "John Doe",
                    phoneNumber: "9861234567",
                },
                {
                    email: "jane.smith@example.com",
                    name: "Jane Smith",
                    phoneNumber: "9871234567",
                },
                {
                    email: "mike.johnson@example.com",
                    name: "Mike Johnson",
                    phoneNumber: "9881234567",
                },
            ];
            for (const u of users) {
                const user = userRepo.create({
                    name: u.name,
                    phoneNumber: u.phoneNumber,
                });
                yield userRepo.save(user);
                const auth = authRepo.create({
                    email: u.email,
                    password: yield hashPassword("user123"),
                    role: enums_1.USER_ROLE.USER,
                    user,
                });
                yield authRepo.save(auth);
            }
            console.log("Users seeded");
            console.log("✅ Database seeding completed");
        }
        catch (error) {
            console.error("❌ Seeding error:", error);
        }
        finally {
            yield AppDataSource.destroy();
        }
    });
}
seedDatabase();
