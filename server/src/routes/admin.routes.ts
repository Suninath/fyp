import express from "express";
import adminController from "../controller/admin.controller";
import { authenticationMiddeware, authorizationMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticationMiddeware);
router.use(authorizationMiddleware(["Admin"]));

// Admin dashboard stats
router.get("/dashboard/stats", adminController.getDashboardStats);

// User management
router.get("/users", adminController.getAllUsers);
router.get("/users/pending-verification", adminController.getPendingVerificationUsers);
router.get("/users/verification-status", adminController.getUsersByVerificationStatus);
router.patch("/users/:userId/block", adminController.blockUser);
router.patch("/users/:userId/unblock", adminController.unblockUser);
router.patch("/users/:userId/verify", adminController.verifyUserAccount);

// Vehicle management
router.get("/vehicles", adminController.getAllVehicles);
router.patch("/vehicles/:vehicleId/block", adminController.blockVehicle);
router.patch("/vehicles/:vehicleId/unblock", adminController.unblockVehicle);
router.delete("/vehicles/:vehicleId", adminController.deleteVehicle);

// User management with edit
router.put("/users/:userId", adminController.updateUser);
router.delete("/users/:userId", adminController.deleteUser);

// Booking management
router.get("/bookings", adminController.getAllBookings);
router.get("/bookings/stats", adminController.getBookingStats);
router.patch("/bookings/:bookingId/status", adminController.updateBookingStatus);

// Payment management
router.get("/payments", adminController.getAllPayments);
router.get("/payments/stats", adminController.getPaymentStats);

// Refund requests
router.get("/refunds", adminController.getRefundRequests);
router.patch("/refunds/:id/review", adminController.reviewRefundRequest);

export default router;