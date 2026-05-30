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

  async forgetPassword(req: Request, res: Response) {
    const result = await authService.forgotPassword(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
    });
  },

  async resetPassword(req: Request, res: Response) {
    const result = await authService.resetPassword(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
    });
  },

  async logout(req: Request, res: Response) {
    const result = await authService.logout(req, res);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
    });
  },

  async registerStore(req: Request, res: Response) {
    const result = await authService.registerStore(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
    });
  },

  async authorize(req: Request, res: Response) {
    const result = await authService.authorize(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      data: result?.data,
    });
  },

  async me(req: Request, res: Response) {
    const result = await authService.me(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      data: result?.data,
    });
  },

  async updateProfile(req: Request, res: Response) {
    const result = await authService.updateProfile(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      data: result?.data,
    });
  },
};

export default authController;
