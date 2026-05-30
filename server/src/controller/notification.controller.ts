import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHandler";
import { notificationService } from "../service/notification.service";

const notificationController = {
  async getNotifications(req: Request, res: Response) {
    const recipientId = Number(req.user?.id);
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const result = await notificationService.getNotificationsForUser(
      recipientId,
      page,
      limit
    );

    sendResponse(res, {
      status: true,
      message: "Notifications retrieved successfully",
      httpCode: 200,
      data: result.items,
      pagination: {
        currentPage: result.pagination.currentPage,
        perpage: result.pagination.perPage,
        totalPages: result.pagination.totalPages,
        count: result.pagination.total,
      },
    });
  },

  async getUnreadCount(req: Request, res: Response) {
    const recipientId = Number(req.user?.id);
    const unreadCount = await notificationService.getUnreadCount(recipientId);

    sendResponse(res, {
      status: true,
      message: "Unread count retrieved successfully",
      httpCode: 200,
      data: { unreadCount },
    });
  },

  async markAsRead(req: Request, res: Response) {
    const recipientId = Number(req.user?.id);
    const notificationId = Number(req.params.id);

    const notification = await notificationService.markAsRead(
      notificationId,
      recipientId
    );

    if (!notification) {
      return sendResponse(res, {
        status: false,
        message: "Notification not found",
        httpCode: 404,
      });
    }

    sendResponse(res, {
      status: true,
      message: "Notification marked as read",
      httpCode: 200,
      data: notification,
    });
  },

  async markAllAsRead(req: Request, res: Response) {
    const recipientId = Number(req.user?.id);
    await notificationService.markAllAsRead(recipientId);

    sendResponse(res, {
      status: true,
      message: "All notifications marked as read",
      httpCode: 200,
    });
  },
};

export default notificationController;
