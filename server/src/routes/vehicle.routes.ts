import express from "express";
import vehicleController from "../controller/vehicle.controller";
import { authenticationMiddeware } from "../middleware/authMiddleware";
import { uploadMultiple, handleMulterError } from "../middleware/multerMiddleware";

const router = express.Router();

// Protected routes - require authentication
router.post("/", authenticationMiddeware, uploadMultiple, handleMulterError, vehicleController.createVehicle);
router.get("/", authenticationMiddeware, vehicleController.getUserVehicles);
router.get("/public/all", vehicleController.getAllVehicles); // Public route
router.get("/public/:id", vehicleController.getPublicVehicleById); // Public single vehicle route
router.get("/:id", authenticationMiddeware, vehicleController.getVehicleById);
router.put("/:id", authenticationMiddeware, uploadMultiple, handleMulterError, vehicleController.updateVehicle);
router.delete("/:id", authenticationMiddeware, vehicleController.deleteVehicle);

export default router;