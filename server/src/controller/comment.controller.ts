import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHandler";
import commentService from "../service/comment.service";

const commentController = {
  async addComment(req: Request, res: Response) {
    const result = await commentService.addComment(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
    });
  },

  async getCommentsByVehicleId(req: Request, res: Response) {
    const result = await commentService.getCommentsByVehicleId(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
      pagination: result.pagination,
    });
  },

  async replyToComment(req: Request, res: Response) {
    const result = await commentService.replyToComment(req);
    sendResponse(res, {
      status: result.status,
      message: result.message,
      httpCode: result.code,
      data: result.data,
    });
  },
};

export default commentController;
