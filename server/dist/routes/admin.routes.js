"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = __importDefault(require("../controller/admin.controller"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Apply auth middleware to all admin routes
router.use(authMiddleware_1.authenticationMiddeware);
router.use((0, authMiddleware_1.authorizationMiddleware)(["Admin"]));
// Admin dashboard stats
router.get("/dashboard/stats", admin_controller_1.default.getDashboardStats);
// User management
router.get("/users", admin_controller_1.default.getAllUsers);
router.get("/users/pending-verification", admin_controller_1.default.getPendingVerificationUsers);
router.get("/users/verification-status", admin_controller_1.default.getUsersByVerificationStatus);
router.patch("/users/:userId/block", admin_controller_1.default.blockUser);
router.patch("/users/:userId/unblock", admin_controller_1.default.unblockUser);
router.patch("/users/:userId/verify", admin_controller_1.default.verifyUserAccount);
// Vehicle management
router.get("/vehicles", admin_controller_1.default.getAllVehicles);
router.patch("/vehicles/:vehicleId/block", admin_controller_1.default.blockVehicle);
router.patch("/vehicles/:vehicleId/unblock", admin_controller_1.default.unblockVehicle);
router.delete("/vehicles/:vehicleId", admin_controller_1.default.deleteVehicle);
// User management with edit
router.put("/users/:userId", admin_controller_1.default.updateUser);
router.delete("/users/:userId", admin_controller_1.default.deleteUser);
// Booking management
router.get("/bookings", admin_controller_1.default.getAllBookings);
router.get("/bookings/stats", admin_controller_1.default.getBookingStats);
router.patch("/bookings/:bookingId/status", admin_controller_1.default.updateBookingStatus);
// Payment management
router.get("/payments", admin_controller_1.default.getAllPayments);
router.get("/payments/stats", admin_controller_1.default.getPaymentStats);
exports.default = router;
