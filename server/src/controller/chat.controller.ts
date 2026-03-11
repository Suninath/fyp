import { Request, Response } from "express";
import { ChatService } from "../service/chat.service";
import { sendResponse } from "../utils/responseHandler";

const chatService = new ChatService();

export class ChatController {
  // Get all conversations for logged-in user
  async getConversations(req: Request, res: Response) {
    try {
      const userId = typeof req.user.id === 'string' ? parseInt(req.user.id, 10) : req.user.id;
      const conversations = await chatService.getUserConversations(userId);

      sendResponse(res, {
        status: true,
        httpCode: 200,
        message: "Conversations fetched successfully",
        data: conversations,
      });
    } catch (error: any) {
      sendResponse(res, {
        status: false,
        httpCode: 500,
        message: error.message || "Failed to fetch conversations",
      });
    }
  }

  // Get messages in a conversation
  async getMessages(req: Request, res: Response) {
    try {
      const userId = typeof req.user.id === 'string' ? parseInt(req.user.id, 10) : req.user.id;
      const otherUserId = parseInt(req.params.otherUserId, 10);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await chatService.getMessages(userId, otherUserId, page, limit);

      sendResponse(res, {
        status: true,
        httpCode: 200,
        message: "Messages fetched successfully",
        data: result,
      });
    } catch (error: any) {
      sendResponse(res, {
        status: false,
        httpCode: 500,
        message: error.message || "Failed to fetch messages",
      });
    }
  }

  // Send a message
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = typeof req.user.id === 'string' ? parseInt(req.user.id, 10) : req.user.id;
      const { receiverId, content } = req.body;

      if (!receiverId || !content || content.trim() === "") {
        return sendResponse(res, {
          status: false,
          httpCode: 400,
          message: "Receiver ID and message content are required",
        });
      }

      const receiverIdNum = parseInt(receiverId, 10);
      const message = await chatService.sendMessage(userId, receiverIdNum, content.trim());

      sendResponse(res, {
        status: true,
        httpCode: 201,
        message: "Message sent successfully",
        data: message,
      });
    } catch (error: any) {
      sendResponse(res, {
        status: false,
        httpCode: 500,
        message: error.message || "Failed to send message",
      });
    }
  }

  // Mark messages as read
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = typeof req.user.id === 'string' ? parseInt(req.user.id, 10) : req.user.id;
      const otherUserId = parseInt(req.params.otherUserId, 10);

      await chatService.markAsRead(userId, otherUserId);

      sendResponse(res, {
        status: true,
        httpCode: 200,
        message: "Messages marked as read",
      });
    } catch (error: any) {
      sendResponse(res, {
        status: false,
        httpCode: 500,
        message: error.message || "Failed to mark messages as read",
      });
    }
  }

  // Update online status
  async updateOnlineStatus(req: Request, res: Response) {
    try {
      const userId = typeof req.user.id === 'string' ? parseInt(req.user.id, 10) : req.user.id;
      const { isOnline } = req.body;

      await chatService.updateOnlineStatus(userId, isOnline);

      sendResponse(res, {
        status: true,
        httpCode: 200,
        message: "Online status updated",
      });
    } catch (error: any) {
      sendResponse(res, {
        status: false,
        httpCode: 500,
        message: error.message || "Failed to update online status",
      });
    }
  }

  // Start conversation with a user (get or create)
  async startConversation(req: Request, res: Response) {
    try {
      const userId = typeof req.user.id === 'string' ? parseInt(req.user.id, 10) : req.user.id;
      const { otherUserId } = req.body;

      if (!otherUserId) {
        return sendResponse(res, {
          status: false,
          httpCode: 400,
          message: "Other user ID is required",
        });
      }

      const otherUserIdNum = parseInt(otherUserId, 10);
      if (userId === otherUserIdNum) {
        return sendResponse(res, {
          status: false,
          httpCode: 400,
          message: "Cannot start conversation with yourself",
        });
      }

      const conversation = await chatService.getOrCreateConversation(userId, otherUserIdNum);

      sendResponse(res, {
        status: true,
        httpCode: 200,
        message: "Conversation ready",
        data: conversation,
      });
    } catch (error: any) {
      sendResponse(res, {
        status: false,
        httpCode: 500,
        message: error.message || "Failed to start conversation",
      });
    }
  }
}
