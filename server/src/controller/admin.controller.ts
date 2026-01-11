import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHandler";
import adminService from "../service/admin.service";

const adminController = {
  async getAllUsers(req: Request, res: Response) {
    const { search, page = 1, limit = 10 } = req.query;
    const result = await adminService.getAllUsers({ search, page: Number(page), limit: Number(limit) });
    sendResponse(res, {
      status: result.status,
      message: result.message || "Users retrieved successfully",
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination,
    });
  },

  async getAllStores(req: Request, res: Response) {
    const { search, page = 1, limit = 10 } = req.query;
    const result = await adminService.getAllStores({ search, page: Number(page), limit: Number(limit) });
    sendResponse(res, {
      status: result.status,
      message: result.message || "Stores retrieved successfully",
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination,
    });
  },

  async verifyStore(req: Request, res: Response) {
    const { storeId } = req.params;
    const result = await adminService.verifyStore(storeId);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  },

  async blockUser(req: Request, res: Response) {
    const { userId } = req.params;
    const result = await adminService.blockUser(userId);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  },

  async unblockUser(req: Request, res: Response) {
    const { userId } = req.params;
    const result = await adminService.unblockUser(userId);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  },

  async blockStore(req: Request, res: Response) {
    const { storeId } = req.params;
    const result = await adminService.blockStore(storeId);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  },

  async unblockStore(req: Request, res: Response) {
    const { storeId } = req.params;
    const result = await adminService.unblockStore(storeId);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  },

  async getDashboardStats(req: Request, res: Response) {
    const result = await adminService.getDashboardStats();
    sendResponse(res, {
      status: result.status,
      message: result.message || "Dashboard stats retrieved successfully",
      httpCode: result.code,
      data: result.data,
    });
  },

  async getAllVehicles(req: Request, res: Response) {
    const { search, brand, color, page = 1, limit = 10 } = req.query;
    const result = await adminService.getAllVehicles({ search, brand, color, page: Number(page), limit: Number(limit) });
    sendResponse(res, {
      status: result.status,
      message: result.message || "Vehicles retrieved successfully",
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination,
    });
  },

  async blockVehicle(req: Request, res: Response) {
    const { vehicleId } = req.params;
    const result = await adminService.blockVehicle(vehicleId);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  },

  async unblockVehicle(req: Request, res: Response) {
    const { vehicleId } = req.params;
    const result = await adminService.unblockVehicle(vehicleId);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  },

  async deleteVehicle(req: Request, res: Response) {
    const { vehicleId } = req.params;
    const result = await adminService.deleteVehicle(vehicleId);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  },

  async updateUser(req: Request, res: Response) {
    const { userId } = req.params;
    const updateData = req.body;
    const result = await adminService.updateUser(userId, updateData);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
    });
  },

  async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    const result = await adminService.deleteUser(userId);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  }
};

export default adminController;