import { Request, Response } from "express";
import { AppDataSource } from "../config/db.config";
import { userEnity } from "../entities/user.entity";

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
