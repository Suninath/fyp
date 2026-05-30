import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";
import { Message } from "./message.entity";

@Entity("conversations")
@Index(["user1", "user2"], { unique: true })
export class Conversation extends BaseEntity {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: "user1_id" })
  user1: UserEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: "user2_id" })
  user2: UserEntity;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @Column({ type: "timestamp", nullable: true })
  lastMessageAt: Date;

  @Column({ type: "text", nullable: true })
  lastMessageText: string;

  @Column({ default: 0 })
  user1UnreadCount: number;

  @Column({ default: 0 })
  user2UnreadCount: number;
}
