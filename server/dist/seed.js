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
const vehicle_entity_1 = require("./entities/vehicle.entity");
const comment_entity_1 = require("./entities/comment.entity");
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
            const vehicleRepo = AppDataSource.getRepository(vehicle_entity_1.VehicleEntity);
            const commentRepo = AppDataSource.getRepository(comment_entity_1.CommentEntity);
            // Clear existing data
            console.log("Clearing existing data...");
            // await commentRepo.delete({});
            // await vehicleRepo.delete({});
            // await authRepo.delete({});
            // await userRepo.delete({}); 
            yield AppDataSource.query('TRUNCATE TABLE "comments", "vehicle", "auth", "users" CASCADE');
            console.log("Data cleared");
            /* ===================== ADMIN ===================== */
            const adminUser = userRepo.create({
                name: "System Administrator",
                phoneNumber: "1234567890",
                phone: "1234567890",
                address: "Delhi, Delhi",
                paymentStatus: true,
            });
            yield userRepo.save(adminUser);
            const adminAuth = authRepo.create({
                email: "admin@autogear.com",
                password: yield hashPassword("admin123"),
                role: enums_1.USER_ROLE.ADMIN,
                verified: true,
                user: adminUser,
            });
            yield authRepo.save(adminAuth);
            console.log("Admin seeded");
            /* ===================== USERS ===================== */
            const users = [
                {
                    email: "john.doe@example.com",
                    name: "John Doe",
                    phoneNumber: "9876543210",
                    address: "Mumbai, Maharashtra",
                },
                {
                    email: "jane.smith@example.com",
                    name: "Jane Smith",
                    phoneNumber: "9123456789",
                    address: "Bangalore, Karnataka",
                },
                {
                    email: "mike.johnson@example.com",
                    name: "Mike Johnson",
                    phoneNumber: "9555123456",
                    address: "Delhi, Delhi",
                },
            ];
            for (const u of users) {
                const user = userRepo.create({
                    name: u.name,
                    phoneNumber: u.phoneNumber,
                    phone: u.phoneNumber,
                    address: u.address,
                    paymentStatus: false,
                });
                yield userRepo.save(user);
                const auth = authRepo.create({
                    email: u.email,
                    password: yield hashPassword("user123"),
                    role: enums_1.USER_ROLE.USER,
                    verified: true,
                    user,
                });
                yield authRepo.save(auth);
            }
            console.log("Users seeded");
            /* ===================== STORES ===================== */
            const stores = [
                {
                    email: "premium.autos@store.com",
                    storeName: "Premium Auto Sales",
                    name: "Rajesh Kumar",
                    phoneNumber: "4449876543",
                    phone: "4449876543",
                    address: "Mumbai, Maharashtra",
                    panNumber: "ABCDE1234F",
                    companyRegistrationDoc: "REG123456789",
                    paymentStatus: true,
                },
                {
                    email: "city.motors@store.com",
                    storeName: "City Motors",
                    name: "Priya Singh",
                    phoneNumber: "6665554444",
                    phone: "6665554444",
                    address: "Delhi, Delhi",
                    panNumber: "FGHIJ5678K",
                    companyRegistrationDoc: "REG987654321",
                    paymentStatus: true,
                },
                {
                    email: "budget.cars@store.com",
                    storeName: "Budget Cars Inc",
                    name: "Amit Patel",
                    phoneNumber: "7778889999",
                    phone: "7778889999",
                    address: "Ahmedabad, Gujarat",
                    panNumber: "LMNOP9012Q",
                    companyRegistrationDoc: "REG456789123",
                    paymentStatus: false,
                },
                {
                    email: "luxury.wheels@store.com",
                    storeName: "Luxury Wheels",
                    name: "Sanjay Gupta",
                    phoneNumber: "8889998877",
                    phone: "8889998877",
                    address: "Bangalore, Karnataka",
                    panNumber: "QRSTU3456V",
                    companyRegistrationDoc: "REG789456123",
                    paymentStatus: true,
                },
                {
                    email: "no.docs@store.com",
                    storeName: "No Docs Auto",
                    name: "Vikram Sharma",
                    phoneNumber: "9990009999",
                    phone: "9990009999",
                    address: "Pune, Maharashtra",
                    panNumber: null,
                    companyRegistrationDoc: null,
                    paymentStatus: true,
                },
            ];
            for (const s of stores) {
                const storeUser = userRepo.create({
                    name: s.name,
                    storeName: s.storeName,
                    phoneNumber: s.phoneNumber,
                    phone: s.phone,
                    address: s.address,
                    panNumber: s.panNumber,
                    companyRegistrationDoc: s.companyRegistrationDoc,
                    paymentStatus: s.paymentStatus,
                });
                yield userRepo.save(storeUser);
                const storeAuth = authRepo.create({
                    email: s.email,
                    password: yield hashPassword("store123"),
                    role: enums_1.USER_ROLE.STORE,
                    verified: true,
                    user: storeUser,
                });
                yield authRepo.save(storeAuth);
            }
            console.log("Stores seeded");
            /* ===================== VEHICLES & COMMENTS ===================== */
            // Fetch users for linking
            const john = yield userRepo.findOneBy({ phoneNumber: "9876543210" }); // John Doe
            const jane = yield userRepo.findOneBy({ phoneNumber: "9123456789" }); // Jane Smith
            const cityMotors = yield userRepo.findOneBy({ phoneNumber: "6665554444" }); // City Motors
            if (john && jane && cityMotors) {
                // 1. Vehicle by John (For Sale)
                const vehicle1 = vehicleRepo.create({
                    name: "Tesla Model 3",
                    make: "Tesla",
                    model: "Model 3",
                    year: 2022,
                    price: 3500000,
                    mileage: 15000,
                    fuelType: "Electric",
                    transmission: "Automatic",
                    color: "Red",
                    location: "Mumbai",
                    condition: "Excellent",
                    description: "Well maintained, single owner Tesla Model 3.",
                    category: vehicle_entity_1.VEHICLE_CATEGORY.BUY_SELL,
                    uploader: john,
                    images: ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
                });
                yield vehicleRepo.save(vehicle1);
                // 2. Vehicle by City Motors (Rent)
                const vehicle2 = vehicleRepo.create({
                    name: "Toyota Fortuner",
                    make: "Toyota",
                    model: "Fortuner",
                    year: 2023,
                    price: 5000, // Daily rent
                    mileage: 5000,
                    fuelType: "Diesel",
                    transmission: "Automatic",
                    color: "White",
                    location: "Delhi",
                    condition: "Good",
                    description: "Available for outstation rentals.",
                    category: vehicle_entity_1.VEHICLE_CATEGORY.RENTING,
                    uploader: cityMotors,
                    images: ["https://images.unsplash.com/photo-1626847037657-fd3622613ce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
                });
                yield vehicleRepo.save(vehicle2);
                console.log("Vehicles seeded");
                /* ===================== COMMENTS ===================== */
                // Jane comments on John's Tesla
                const comment1 = commentRepo.create({
                    content: "Is this price negotiable?",
                    user: jane,
                    vehicle: vehicle1,
                });
                yield commentRepo.save(comment1);
                // John replies to Jane using structured reply
                const reply1 = commentRepo.create({
                    content: "Yes, slightly negotiable nearby table.",
                    user: john,
                    vehicle: vehicle1,
                    parent: comment1
                });
                yield commentRepo.save(reply1);
                // John comments on City Motor's Fortuner
                const comment2 = commentRepo.create({
                    content: "Is driver included?",
                    user: john,
                    vehicle: vehicle2,
                });
                yield commentRepo.save(comment2);
                console.log("Comments seeded");
            }
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
