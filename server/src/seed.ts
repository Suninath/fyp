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
      phoneNumber: "9841234567",
    });
    await userRepo.save(adminUser);

    const adminAuth = authRepo.create({
      email: "admin@autogear.com",
      password: await hashPassword("admin123"),
      role: USER_ROLE.ADMIN,
      user: adminUser,
    });
    await authRepo.save(adminAuth);

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
      await userRepo.save(user);

      const auth = authRepo.create({
        email: u.email,
        password: await hashPassword("user123"),
        role: USER_ROLE.USER,
        user,
      });
      await authRepo.save(auth);
    }

    console.log("Users seeded");
    console.log("✅ Database seeding completed");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase();
