import { Request, Response } from "express";
import loginService from "../service/auth.service";
import { sendResponse } from "../utils/responseHandler";

export const loginController = async (req: Request, res: Response) => {
  const result = await loginService.login(req, res);
  sendResponse(res, {
    status: result?.status,
    message: result?.message,
    httpCode: result?.code,
    data: result?.data,
  });
};
