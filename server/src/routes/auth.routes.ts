import express from "express";
import authController from "../controller/auth.controller";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/verifyOtp",authController.verifyOtp)
router.post("/forgetPassword", authController.forgetPassword);
router.post("/resetPassword", authController.resetPassword);

export default router;
