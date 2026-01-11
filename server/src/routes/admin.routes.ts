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
router.patch("/users/:userId/block", adminController.blockUser);
router.patch("/users/:userId/unblock", adminController.unblockUser);

// Store management
router.get("/stores", adminController.getAllStores);
router.patch("/stores/:storeId/verify", adminController.verifyStore);
router.patch("/stores/:storeId/block", adminController.blockStore);
router.patch("/stores/:storeId/unblock", adminController.unblockStore);

// Vehicle management
router.get("/vehicles", adminController.getAllVehicles);
router.patch("/vehicles/:vehicleId/block", adminController.blockVehicle);
router.patch("/vehicles/:vehicleId/unblock", adminController.unblockVehicle);
router.delete("/vehicles/:vehicleId", adminController.deleteVehicle);

// User management with edit
router.put("/users/:userId", adminController.updateUser);
router.delete("/users/:userId", adminController.deleteUser);

export default router;