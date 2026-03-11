import express from "express";
import reviewController from "../controller/review.controller";
import { authenticationMiddeware } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/vehicle/:vehicleId", reviewController.getVehicleReviews);

// Protected routes (require authentication)
router.post("/", authenticationMiddeware, reviewController.createReview);
router.get("/my-reviews", authenticationMiddeware, reviewController.getUserReviews);
router.get("/booking/:bookingId", authenticationMiddeware, reviewController.getBookingReview);
router.get("/booking/:bookingId/can-review", authenticationMiddeware, reviewController.canReviewBooking);
router.put("/:reviewId", authenticationMiddeware, reviewController.updateReview);
router.delete("/:reviewId", authenticationMiddeware, reviewController.deleteReview);

export default router;
