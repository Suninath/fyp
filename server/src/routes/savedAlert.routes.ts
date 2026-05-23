import express from "express";
import savedAlertController from "../controller/savedAlert.controller";
import { authenticationMiddeware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authenticationMiddeware);

router.post("/", savedAlertController.createAlert);
router.get("/", savedAlertController.listAlerts);
router.delete("/:id", savedAlertController.removeAlert);
router.delete("/", savedAlertController.clearAlerts);

export default router;
