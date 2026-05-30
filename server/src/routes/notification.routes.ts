import express from "express";
import notificationController from "../controller/notification.controller";
import { authenticationMiddeware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authenticationMiddeware);

router.get("/", notificationController.getNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);

export default router;
