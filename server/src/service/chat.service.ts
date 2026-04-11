import AppDataSource from "../config/db.config";
import { USER_ROLE } from "../constant/enums";
import { Conversation } from "../entities/conversation.entity";
import { Message } from "../entities/message.entity";
import { VehicleEntity } from "../entities/vehicle.entity";
import { UserEntity } from "../entities/user.entity";
import { NOTIFICATION_TYPE } from "../entities/notification.entity";
import { notificationService } from "./notification.service";
import { In } from "typeorm";

export class ChatService {
  private get conversationRepo() {
    return AppDataSource.getRepository(Conversation);
  }

  private get messageRepo() {
    return AppDataSource.getRepository(Message);
  }

  private get userRepo() {
    return AppDataSource.getRepository(UserEntity);
  }

  private get vehicleRepo() {
    return AppDataSource.getRepository(VehicleEntity);
  }

  private async getUserWithAuth(userId: number) {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: ["auth"],
    });
  }

  private async getPrimaryAdminUser() {
    return this.userRepo
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.auth", "auth", "auth.role = :role", {
        role: USER_ROLE.ADMIN,
      })
      .orderBy("user.id", "ASC")
      .getOne();
  }

  private validateChatPermissionBetweenUsers(role1: USER_ROLE, role2: USER_ROLE) {
    const userMustChatWithAdminOnly =
      (role1 === USER_ROLE.USER && role2 !== USER_ROLE.ADMIN) ||
      (role2 === USER_ROLE.USER && role1 !== USER_ROLE.ADMIN);

    if (userMustChatWithAdminOnly) {
      throw new Error("Users can only chat with admin");
    }
  }

  // Get or create conversation between two users
  async getOrCreateConversation(userId1: number, userId2: number) {
    const user1 = await this.getUserWithAuth(userId1);
    const user2 = await this.getUserWithAuth(userId2);

    if (!user1 || !user2 || !user1.auth || !user2.auth) {
      throw new Error("User not found");
    }

    this.validateChatPermissionBetweenUsers(user1.auth.role, user2.auth.role);

    // Check if conversation exists (in either direction)
    let conversation = await this.conversationRepo
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.user1", "user1")
      .leftJoinAndSelect("conversation.user2", "user2")
      .where(
        "(conversation.user1.id = :userId1 AND conversation.user2.id = :userId2) OR (conversation.user1.id = :userId2 AND conversation.user2.id = :userId1)",
        { userId1, userId2 },
      )
      .getOne();

    if (!conversation) {
      conversation = this.conversationRepo.create({
        user1,
        user2,
      });
      await this.conversationRepo.save(conversation);
    }

    return conversation;
  }

  // Get all conversations for a user
  async getUserConversations(userId: number) {
    const requestUser = await this.getUserWithAuth(userId);
    if (!requestUser?.auth) {
      throw new Error("User not found");
    }

    const conversations = await this.conversationRepo
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.user1", "user1")
      .leftJoinAndSelect("conversation.user2", "user2")
      .where("conversation.user1.id = :userId OR conversation.user2.id = :userId", { userId })
      .orderBy("conversation.lastMessageAt", "DESC")
      .getMany();

    if (!conversations.length) {
      return [];
    }

    const participantIds = Array.from(
      new Set(
        conversations.flatMap((conversation) => [
          conversation.user1.id,
          conversation.user2.id,
        ]),
      ),
    );

    const participants = await this.userRepo.find({
      where: { id: In(participantIds) },
      relations: ["auth"],
    });

    const roleByUserId = new Map<number, USER_ROLE>();
    participants.forEach((participant) => {
      if (participant.auth?.role) {
        roleByUserId.set(participant.id, participant.auth.role);
      }
    });

    return conversations
      .filter((conversation) => {
        const otherUser =
          conversation.user1.id === userId ? conversation.user2 : conversation.user1;

        if (requestUser.auth.role !== USER_ROLE.USER) {
          return true;
        }

        return roleByUserId.get(otherUser.id) === USER_ROLE.ADMIN;
      })
      .map((conv) => {
        const otherUser = conv.user1.id === userId ? conv.user2 : conv.user1;
        const unreadCount = conv.user1.id === userId ? conv.user1UnreadCount : conv.user2UnreadCount;

        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            profileImage: otherUser.profileImage,
            isOnline: otherUser.isOnline,
            lastSeen: otherUser.lastSeen,
          },
          lastMessageText: conv.lastMessageText,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
        };
      });
  }

  async startVehicleInterestConversation(
    interestedUserId: number,
    vehicleId: number,
    customMessage?: string,
  ) {
    const interestedUser = await this.getUserWithAuth(interestedUserId);
    if (!interestedUser?.auth) {
      throw new Error("User not found");
    }

    const primaryAdmin = await this.getPrimaryAdminUser();
    if (!primaryAdmin?.auth) {
      throw new Error("No admin account available");
    }

    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId, isBlocked: false },
      relations: ["uploader"],
    });

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    const conversation = await this.getOrCreateConversation(interestedUserId, primaryAdmin.id);

    const existingMessageCount = await this.messageRepo.count({
      where: { conversation: { id: conversation.id } },
    });

    const interestMessage =
      customMessage?.trim() ||
      `Hi, I am interested in vehicle #${vehicle.id}: ${vehicle.name} (${vehicle.make} ${vehicle.model}, ${vehicle.year}). Please help me connect with the seller.`;

    // Send the auto interest message only once per user-admin conversation.
    if (existingMessageCount === 0) {
      await this.sendMessage(interestedUserId, primaryAdmin.id, interestMessage);

      await notificationService.createForAdmins({
        type: NOTIFICATION_TYPE.SYSTEM,
        title: "New Vehicle Interest",
        message: `${interestedUser.name || "A user"} is interested in ${vehicle.name}.`,
        data: {
          route: "/admin/messages",
          vehicleId: vehicle.id,
          interestedUserId: interestedUser.id,
          sellerId: vehicle.uploader?.id || null,
        },
      });
    }

    return {
      conversationId: conversation.id,
      admin: {
        id: primaryAdmin.id,
        name: primaryAdmin.name || "Admin Support",
        profileImage: primaryAdmin.profileImage,
        isOnline: primaryAdmin.isOnline,
        lastSeen: primaryAdmin.lastSeen,
      },
    };
  }

  // Send a message
  async sendMessage(senderId: number, receiverId: number, content: string) {
    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    const sender = await this.getUserWithAuth(senderId);
    const receiver = await this.getUserWithAuth(receiverId);

    if (!sender || !receiver || !sender.auth || !receiver.auth) {
      throw new Error("User not found");
    }

    this.validateChatPermissionBetweenUsers(sender.auth.role, receiver.auth.role);

    const message = this.messageRepo.create({
      conversation,
      sender,
      receiver,
      content,
    });

    await this.messageRepo.save(message);

    // Update conversation
    conversation.lastMessageText = content;
    conversation.lastMessageAt = new Date();

    if (conversation.user1.id === receiverId) {
      conversation.user1UnreadCount += 1;
    } else {
      conversation.user2UnreadCount += 1;
    }

    await this.conversationRepo.save(conversation);

    // Return message with sender and receiver included
    return {
      id: message.id,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      sender: {
        id: sender.id,
        name: sender.name,
        profileImage: sender.profileImage,
      },
      receiver: {
        id: receiver.id,
        name: receiver.name,
        profileImage: receiver.profileImage,
      },
    };
  }

  // Get messages in a conversation
  async getMessages(userId: number, otherUserId: number, page: number = 1, limit: number = 50) {
    const conversation = await this.getOrCreateConversation(userId, otherUserId);

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { conversation: { id: conversation.id } },
      relations: ["sender", "receiver"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      messages: messages.reverse().map((msg) => ({
        id: msg.id,
        content: msg.content,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          profileImage: msg.sender.profileImage,
        },
        receiver: {
          id: msg.receiver.id,
          name: msg.receiver.name,
          profileImage: msg.receiver.profileImage,
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Mark messages as read
  async markAsRead(userId: number, otherUserId: number) {
    const conversation = await this.getOrCreateConversation(userId, otherUserId);

    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where("conversation_id = :conversationId AND receiver_id = :userId AND isRead = false", {
        conversationId: conversation.id,
        userId,
      })
      .execute();

    // Reset unread count
    if (conversation.user1.id === userId) {
      conversation.user1UnreadCount = 0;
    } else {
      conversation.user2UnreadCount = 0;
    }

    await this.conversationRepo.save(conversation);
  }

  // Update user online status
  async updateOnlineStatus(userId: number, isOnline: boolean) {
    await this.userRepo.update(userId, {
      isOnline,
      lastSeen: new Date(),
    });
  }
}
