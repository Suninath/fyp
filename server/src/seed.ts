import { config } from "dotenv";
config();

import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";

import { AuthEntity } from "./entities/auth.entity";
import { UserEntity } from "./entities/user.entity";
import { USER_ROLE } from "./constant/enums";

const AppDataSource = new DataSource({
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

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const userRepo = AppDataSource.getRepository(UserEntity);
    const authRepo = AppDataSource.getRepository(AuthEntity);

    /* ===================== ADMIN ===================== */
    const adminUser = userRepo.create({
      name: "System Administrator",
      phoneNumber: "1234567890",
      paymentStatus: true,
    });
    await userRepo.save(adminUser);

    const adminAuth = authRepo.create({
      email: "admin@autogear.com",
      password: await hashPassword("admin123"),
      role: USER_ROLE.ADMIN,
      verified: true,
      user: adminUser,
    });
    await authRepo.save(adminAuth);

    console.log("Admin seeded");

    /* ===================== USERS ===================== */
    const users = [
      {
        email: "john.doe@example.com",
        name: "John Doe",
        phoneNumber: "9876543210",
      },
      {
        email: "jane.smith@example.com",
        name: "Jane Smith",
        phoneNumber: "9123456789",
      },
      {
        email: "mike.johnson@example.com",
        name: "Mike Johnson",
        phoneNumber: "9555123456",
      },
    ];

    for (const u of users) {
      const user = userRepo.create({
        name: u.name,
        phoneNumber: u.phoneNumber,
        paymentStatus: false,
      });
      await userRepo.save(user);

      const auth = authRepo.create({
        email: u.email,
        password: await hashPassword("user123"),
        role: USER_ROLE.USER,
        verified: true,
        user,
      });
      await authRepo.save(auth);
    }

    console.log("Users seeded");

    /* ===================== STORES ===================== */
    const stores = [
      {
        email: "premium.autos@store.com",
        name: "Premium Auto Sales",
        phoneNumber: "4449876543",
        panNumber: "ABCDE1234F",
        companyRegistrationDoc: "REG123456789",
        paymentStatus: true,
      },
      {
        email: "city.motors@store.com",
        name: "City Motors",
        phoneNumber: "6665554444",
        panNumber: "FGHIJ5678K",
        companyRegistrationDoc: "REG987654321",
        paymentStatus: true,
      },
      {
        email: "budget.cars@store.com",
        name: "Budget Cars Inc",
        phoneNumber: "7778889999",
        panNumber: "LMNOP9012Q",
        companyRegistrationDoc: "REG456789123",
        paymentStatus: false,
      },
    ];

    for (const s of stores) {
      const storeUser = userRepo.create({
        name: s.name,
        phoneNumber: s.phoneNumber,
        panNumber: s.panNumber,
        companyRegistrationDoc: s.companyRegistrationDoc,
        paymentStatus: s.paymentStatus,
      });
      await userRepo.save(storeUser);

      const storeAuth = authRepo.create({
        email: s.email,
        password: await hashPassword("store123"),
        role: USER_ROLE.STORE,
        verified: true,
        user: storeUser,
      });
      await authRepo.save(storeAuth);
    }

    console.log("Stores seeded");
    console.log("✅ Database seeding completed");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase();
