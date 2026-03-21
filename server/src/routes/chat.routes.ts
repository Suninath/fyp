import { Router } from "express";
import { ChatController } from "../controller/chat.controller";
import { authenticationMiddeware } from "../middleware/authMiddleware";

const router = Router();
const chatController = new ChatController();

// All routes require authentication
router.use(authenticationMiddeware);

// Get all conversations
router.get("/conversations", chatController.getConversations);

// Start a conversation
router.post("/conversations/start", chatController.startConversation);

// Start a vehicle-interest conversation with admin
router.post("/conversations/interest", chatController.startInterestConversation);

// Get messages in a conversation
router.get("/messages/:otherUserId", chatController.getMessages);

// Send a message
router.post("/messages", chatController.sendMessage);

// Mark messages as read
router.put("/messages/:otherUserId/read", chatController.markAsRead);

// Update online status
router.put("/status", chatController.updateOnlineStatus);

export default router;
