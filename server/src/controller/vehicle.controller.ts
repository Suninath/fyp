import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHandler";
import vehicleService from "../service/vehicle.service";

const vehicleController = {
  async createVehicle(req: Request, res: Response) {
    const result: any = await vehicleService.createVehicle(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      errorCode: result?.errorCode,
      limitType: result?.limitType,
      currentCount: result?.currentCount,
      limit: result?.limit,
      resetAt: result?.resetAt,
      retryAfter: result?.retryAfter,
    });
  },

  async getUserVehicles(req: Request, res: Response) {
    const result = await vehicleService.getUserVehicles(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      data: result?.data?.vehicles,
      pagination: result?.data?.pagination,
    });
  },

  async getVehicleById(req: Request, res: Response) {
    const result = await vehicleService.getVehicleById(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      data: result?.data,
    });
  },

  async getPublicVehicleById(req: Request, res: Response) {
    const result = await vehicleService.getPublicVehicleById(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      data: result?.data,
    });
  },

  async updateVehicle(req: Request, res: Response) {
    const result = await vehicleService.updateVehicle(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      data: result?.data,
    });
  },

  async deleteVehicle(req: Request, res: Response) {
    const result = await vehicleService.deleteVehicle(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
    });
  },

  async getAllVehicles(req: Request, res: Response) {
    const result = await vehicleService.getAllVehicles(req);
    sendResponse(res, {
      status: result?.status,
      message: result?.message,
      httpCode: result?.code,
      data: result?.data?.vehicles,
      pagination: result?.data?.pagination,
    });
  },
};

export default vehicleController;