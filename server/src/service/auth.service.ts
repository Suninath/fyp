import { Request, Response } from "express";

import { genAcccessToken, genRefreshToken } from "../utils/tokenGen";
import { comparePassword, hashPassword } from "../helper/passwordHelper";
import AppDataSource from "../config/db.config";
import { UserEntity } from "../entities/user.entity";

const userRepository = AppDataSource.getRepository(UserEntity);

const authService = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    console.log(email, password);

    try {
      if (!email || !password) {
        return {
          status: false,
          code: 400,
          message: "Invalid email or password",
        };
      }

      const existingUser = await userRepository.findOne({
        where: { email },
      });

      if (!existingUser) {
        return {
          status: false,
          code: 400,
          message: "Invalid email or password",
        };
      }

      // Here you can add password verification (e.g., bcrypt.compare)
      const matchPassword = comparePassword(password, existingUser?.password);
      if (!matchPassword) {
        return {
          status: false,
          code: 400,
          message: "Invalid email or password",
        };
      }

      const accessToken = genAcccessToken({
        email: existingUser?.email,
        id: existingUser?.id,
        role: existingUser?.role,
      });

      const refreshToken = genRefreshToken({
        email: existingUser?.email,
        id: existingUser?.id,
        role: existingUser?.role,
      });

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      return {
        status: false,
        code: 200,
        message: "Login successful",
        data: existingUser.role,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async register(req: Request) {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    console.log(firstName, lastName, email, phoneNumber, password);

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return {
        status: false,
        code: 400,
        message: "All fields are required",
      };
    }

    const existingUser = await userRepository.findOneBy({ email });

    console.log("existingUser", existingUser);

    if (existingUser) {
      return {
        status: false,
        code: 409,
        message: "User already exists",
      };
    }

    const hashedPassword = await hashPassword(password);
    console.log("hashedpasword", hashedPassword);

    const newUser = userRepository.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    console.log("newUser entity:", newUser);

    await userRepository.save(newUser);

    return {
      status: true,
      code: 201,
      message: "User registered successfully. Please login.",
    };
  },
};

export default authService;
