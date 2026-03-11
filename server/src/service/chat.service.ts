import AppDataSource from "../config/db.config";
import { Conversation } from "../entities/conversation.entity";
import { Message } from "../entities/message.entity";
import { UserEntity } from "../entities/user.entity";
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

  // Get or create conversation between two users
  async getOrCreateConversation(userId1: number, userId2: number) {
    const user1 = await this.userRepo.findOne({ where: { id: userId1 } });
    const user2 = await this.userRepo.findOne({ where: { id: userId2 } });

    if (!user1 || !user2) {
      throw new Error("User not found");
    }

    // Check if conversation exists (in either direction)
    let conversation = await this.conversationRepo
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.user1", "user1")
      .leftJoinAndSelect("conversation.user2", "user2")
      .where(
        "(conversation.user1.id = :userId1 AND conversation.user2.id = :userId2) OR (conversation.user1.id = :userId2 AND conversation.user2.id = :userId1)",
        { userId1, userId2 }
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
    const conversations = await this.conversationRepo
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.user1", "user1")
      .leftJoinAndSelect("conversation.user2", "user2")
      .where("conversation.user1.id = :userId OR conversation.user2.id = :userId", { userId })
      .orderBy("conversation.lastMessageAt", "DESC")
      .getMany();

    return conversations.map((conv) => {
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

  // Send a message
  async sendMessage(senderId: number, receiverId: number, content: string) {
    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const receiver = await this.userRepo.findOne({ where: { id: receiverId } });

    if (!sender || !receiver) {
      throw new Error("User not found");
    }

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
