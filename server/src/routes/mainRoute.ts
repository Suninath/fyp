import express from "express";
import authRoute from "./auth.routes";
import adminRoute from "./admin.routes";

const router = express.Router();

router.use("/api/v1/auth", authRoute);
router.use("/api/v1/admin", adminRoute);

export default router;