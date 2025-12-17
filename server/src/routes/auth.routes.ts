import express from "express";
import authController from "../controller/auth.controller";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/verifyOtp",authController.verifyOtp)

export default router;
