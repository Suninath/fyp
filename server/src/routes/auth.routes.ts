import express from "express";
import authController from "../controller/auth.controller";
import { authenticationMiddeware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/registerStore", authController.registerStore);
router.post("/verifyOtp",authController.verifyOtp)
router.post("/forgetPassword", authController.forgetPassword);
router.post("/resetPassword", authController.resetPassword);
router.post("/logout", authController.logout);

// Protected routes
router.get("/authorize", authenticationMiddeware, authController.authorize);
router.get("/me", authenticationMiddeware, authController.me);
router.put("/profile", authenticationMiddeware, authController.updateProfile);

export default router;
