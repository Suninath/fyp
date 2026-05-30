import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHandler";
import reviewService from "../service/review.service";

const reviewController = {
  async createReview(req: Request, res: Response) {
    const result = await reviewService.createReview(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
    });
  },

  async getVehicleReviews(req: Request, res: Response) {
    const result = await reviewService.getVehicleReviews(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination,
    });
  },

  async getBookingReview(req: Request, res: Response) {
    const result = await reviewService.getBookingReview(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
    });
  },

  async updateReview(req: Request, res: Response) {
    const result = await reviewService.updateReview(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
    });
  },

  async deleteReview(req: Request, res: Response) {
    const result = await reviewService.deleteReview(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
    });
  },

  async getUserReviews(req: Request, res: Response) {
    const result = await reviewService.getUserReviews(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination,
    });
  },

  async canReviewBooking(req: Request, res: Response) {
    const result = await reviewService.canReviewBooking(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
    });
  },
};

export default reviewController;
