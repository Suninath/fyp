import { Request, Response } from "express";
import { AppDataSource } from "../config/db.config";
import { userEnity } from "../entities/user.entity";
import { genAcccessToken, genRefreshToken } from "../utils/tokenGen";
import { comaprePassowrd } from "../helper/passwordHelper";

const userRepository = AppDataSource.getRepository(userEnity);

const loginService = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

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
      const matchPassword = comaprePassowrd(password, existingUser?.password);
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
};

export default loginService;
