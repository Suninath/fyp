import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHandler";
import adminService from "../service/admin.service";

const adminController = {
  async getAllUsers(req: Request, res: Response) {
    const { search, page = 1, limit = 10 } = req.query;
    const result = await adminService.getAllUsers({ search: search as string, page: Number(page), limit: Number(limit) });
    sendResponse(res, {
      status: result.status,
      message: result.message || "Users retrieved successfully",
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination,
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
    const result = await adminService.getAllVehicles({ 
      search: search as string, 
      brand: brand as string, 
      color: color as string, 
      page: Number(page), 
      limit: Number(limit) 
    });
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
  },

  async getPendingVerificationUsers(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    const result = await adminService.getPendingVerificationUsers({ 
      page: Number(page), 
      limit: Number(limit) 
    });
    sendResponse(res, {
      status: result.status,
      message: result.message || "Pending verification users retrieved successfully",
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination,
    });
  },

  async verifyUserAccount(req: Request, res: Response) {
    const { userId } = req.params;
    const { approved, rejectionReason } = req.body;
    const result = await adminService.verifyUserAccount(userId, approved, rejectionReason);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
    });
  },

  async getUsersByVerificationStatus(req: Request, res: Response) {
    const { status, search, page = 1, limit = 10 } = req.query;
    const result = await adminService.getUsersByVerificationStatus({
      status: status as 'pending' | 'verified' | 'rejected',
      search: search as string,
      page: Number(page),
      limit: Number(limit)
    });
    sendResponse(res, {
      status: result.status,
      message: result.message || "Users retrieved successfully",
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination,
    });
  },

  async getAllBookings(req: Request, res: Response) {
    const { page = 1, limit = 10, status } = req.query;
    const { bookingService } = await import("../service/booking.service");
    const result = await bookingService.getAllBookings(
      Number(page), 
      Number(limit),
      status as string
    );
    sendResponse(res, {
      status: result.status,
      message: result.message || "Bookings retrieved successfully",
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination ? {
        currentPage: result.pagination.currentPage,
        perpage: result.pagination.perPage,
        totalPages: result.pagination.totalPages,
        count: result.pagination.total,
      } : undefined,
    });
  },

  async updateBookingStatus(req: Request, res: Response) {
    const { bookingId } = req.params;
    const { status } = req.body;
    const { bookingService } = await import("../service/booking.service");
    const result = await bookingService.updateBookingStatus(
      Number(bookingId),
      status
    );
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
    });
  },

  async getBookingStats(req: Request, res: Response) {
    const { bookingService } = await import("../service/booking.service");
    const result = await bookingService.getBookingStats();
    sendResponse(res, {
      status: result.status,
      message: result.message || "Booking stats retrieved successfully",
      httpCode: result.code,
      data: result.data,
    });
  },

  async getAllPayments(req: Request, res: Response) {
    const { page = 1, limit = 10, status, method } = req.query;
    const { bookingService } = await import("../service/booking.service");
    const result = await bookingService.getAllPayments(
      Number(page),
      Number(limit),
      status as string,
      method as string
    );
    sendResponse(res, {
      status: result.status,
      message: result.message || "Payments retrieved successfully",
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination ? {
        currentPage: result.pagination.currentPage,
        perpage: result.pagination.perPage,
        totalPages: result.pagination.totalPages,
        count: result.pagination.total,
      } : undefined,
    });
  },

  async getPaymentStats(req: Request, res: Response) {
    const { bookingService } = await import("../service/booking.service");
    const result = await bookingService.getPaymentStats();
    sendResponse(res, {
      status: result.status,
      message: result.message || "Payment stats retrieved successfully",
      httpCode: result.code,
      data: result.data,
    });
  }
};

export default adminController;