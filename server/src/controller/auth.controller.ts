import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHandler";
import authService from "../service/auth.service";

const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req, res);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      data: result?.data,
    });
  },

  async register(req: Request, res: Response) {
    const result = await authService.register(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
    });
  },

  async verifyOtp(req: Request, res: Response) {
    const result = await authService.verifyOtp(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
    });
  },
};

export default authController;
