import { Request, Response } from "express";
import { savedAlertService } from "../service/savedAlert.service";

const map = (a: any) => ({ id: a.id, vehicleId: a.vehicleId, name: a.name, criteria: a.criteria || null, createdAt: a.createdAt });

const createAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { vehicleId, name, criteria } = req.body;
    if (!vehicleId) return res.status(400).json({ message: "vehicleId is required" });
    const saved = await savedAlertService.create({ userId, vehicleId: String(vehicleId), name, criteria });
    return res.json({ data: map(saved), message: "Alert saved" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to save alert" });
  }
};

const listAlerts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const items = await savedAlertService.listForUser(userId);
    return res.json({ data: items.map(map) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

const removeAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });
    const removed = await savedAlertService.remove(id, userId);
    if (!removed) return res.status(404).json({ message: "Not found or unauthorized" });
    return res.json({ data: map(removed), message: "Removed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to remove alert" });
  }
};

const clearAlerts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    await savedAlertService.clearForUser(userId);
    return res.json({ message: "Cleared" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to clear alerts" });
  }
};

export default { createAlert, listAlerts, removeAlert, clearAlerts };
