import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";
import { Conversation } from "./conversation.entity";

@Entity("messages")
export class Message extends BaseEntity {
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: "conversation_id" })
  conversation: Conversation;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: "sender_id" })
  sender: UserEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: "receiver_id" })
  receiver: UserEntity;

  @Column({ type: "text" })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: "timestamp", nullable: true })
  readAt: Date;
}
