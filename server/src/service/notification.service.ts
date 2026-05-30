import AppDataSource from "../config/db.config";
import { USER_ROLE } from "../constant/enums";
import {
  NOTIFICATION_TYPE,
  NotificationEntity,
} from "../entities/notification.entity";
import { UserEntity } from "../entities/user.entity";
import { emitNotificationToUser } from "../config/socket.config";

const notificationRepository = AppDataSource.getRepository(NotificationEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

interface CreateNotificationInput {
  recipientId: number;
  recipientRole: USER_ROLE;
  type: NOTIFICATION_TYPE;
  title: string;
  message: string;
  data?: Record<string, any>;
}

interface BroadcastToAdminsInput {
  type: NOTIFICATION_TYPE;
  title: string;
  message: string;
  data?: Record<string, any>;
}

const mapNotification = (notification: NotificationEntity) => ({
  id: notification.id,
  recipientId: notification.recipientId,
  recipientRole: notification.recipientRole,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  data: notification.data || null,
  isRead: notification.isRead,
  readAt: notification.readAt || null,
  createdAt: notification.createdAt,
});

export const notificationService = {
  async createNotification(input: CreateNotificationInput) {
    const notification = notificationRepository.create({
      recipientId: input.recipientId,
      recipientRole: input.recipientRole,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      isRead: false,
    });

    const saved = await notificationRepository.save(notification);
    const mapped = mapNotification(saved);

    // Push instantly to online users; offline users will fetch from the API later.
    emitNotificationToUser(input.recipientId, mapped);

    return mapped;
  },

  async createForAdmins(input: BroadcastToAdminsInput) {
    const admins = await userRepository
      .createQueryBuilder("user")
      .innerJoin("user.auth", "auth", "auth.role = :role", {
        role: USER_ROLE.ADMIN,
      })
      .select("user.id", "id")
      .getRawMany<{ id: number }>();

    if (!admins.length) {
      return [];
    }

    return Promise.all(
      admins.map((admin) =>
        this.createNotification({
          recipientId: admin.id,
          recipientRole: USER_ROLE.ADMIN,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data,
        })
      )
    );
  },

  async getNotificationsForUser(recipientId: number, page = 1, limit = 20) {
    const [items, total] = await notificationRepository.findAndCount({
      where: { recipientId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map(mapNotification),
      pagination: {
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  },

  async getUnreadCount(recipientId: number) {
    return notificationRepository.count({
      where: {
        recipientId,
        isRead: false,
      },
    });
  },

  async markAsRead(notificationId: number, recipientId: number) {
    const notification = await notificationRepository.findOne({
      where: { id: notificationId, recipientId },
    });

    if (!notification) {
      return null;
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notificationRepository.save(notification);
    }

    return mapNotification(notification);
  },

  async markAllAsRead(recipientId: number) {
    await notificationRepository
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ isRead: true, readAt: new Date() })
      .where("recipient_id = :recipientId", { recipientId })
      .andWhere("is_read = :isRead", { isRead: false })
      .execute();
  },
};
