import AppDataSource from "../config/db.config";
import { SavedAlertEntity } from "../entities/saved_alert.entity";

const savedAlertRepository = AppDataSource.getRepository(SavedAlertEntity);

export const savedAlertService = {
  async create(input: { userId?: number; vehicleId: string; name?: string; criteria?: Record<string, any> }) {
    const alert = savedAlertRepository.create({
      userId: input.userId,
      vehicleId: input.vehicleId,
      name: input.name,
      criteria: input.criteria,
    });
    const saved = await savedAlertRepository.save(alert);
    return saved;
  },

  async listForUser(userId: number) {
    const items = await savedAlertRepository.find({ where: { userId }, order: { createdAt: "DESC" } });
    return items;
  },

  async remove(id: number, userId?: number) {
    const item = await savedAlertRepository.findOne({ where: { id } });
    if (!item) return null;
    if (userId && item.userId !== userId) return null;
    await savedAlertRepository.remove(item);
    return item;
  },

  async clearForUser(userId: number) {
    return savedAlertRepository.delete({ userId });
  },
};
