import express from "express";
import authRoute from "./auth.routes";
import adminRoute from "./admin.routes";
import vehicleRoute from "./vehicle.routes";
import commentRoute from "./comment.routes";
import bookingRoute from "./booking.routes";
import chatRoute from "./chat.routes";
import documentRoute from "./document.routes";
import reviewRoute from "./review.routes";

const router = express.Router();

router.use("/api/v1/auth", authRoute);
router.use("/api/v1/admin", adminRoute);
router.use("/api/v1/vehicles", vehicleRoute);
router.use("/api/v1/comments", commentRoute);
router.use("/api/v1/bookings", bookingRoute);
router.use("/api/v1/chat", chatRoute);
router.use("/api/v1/documents", documentRoute);
router.use("/api/v1/reviews", reviewRoute);

export default router;