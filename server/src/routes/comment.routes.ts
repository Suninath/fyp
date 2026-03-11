import express from "express";
import commentController from "../controller/comment.controller";
import { authenticationMiddeware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticationMiddeware, commentController.addComment);
router.get("/:vehicleId", commentController.getCommentsByVehicleId);
router.post("/:commentId/reply", authenticationMiddeware, commentController.replyToComment);

export default router;
