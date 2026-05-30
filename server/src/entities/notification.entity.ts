import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";
import { USER_ROLE } from "../constant/enums";

export enum NOTIFICATION_TYPE {
  BOOKING_CREATED = "BOOKING_CREATED",
  BOOKING_STATUS_UPDATED = "BOOKING_STATUS_UPDATED",
  BOOKING_CANCELLED = "BOOKING_CANCELLED",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  DOCUMENT_SUBMITTED = "DOCUMENT_SUBMITTED",
  DOCUMENT_VERIFIED = "DOCUMENT_VERIFIED",
  ACCOUNT_STATUS_CHANGED = "ACCOUNT_STATUS_CHANGED",
  SYSTEM = "SYSTEM",
}

@Entity("notifications")
@Index(["recipientId", "isRead"])
@Index(["recipientId", "createdAt"])
export class NotificationEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "recipient_id" })
  recipient: UserEntity;

  @Column({ name: "recipient_id" })
  recipientId: number;

  @Column({ name: "recipient_role", type: "enum", enum: USER_ROLE })
  recipientRole: USER_ROLE;

  @Column({ type: "enum", enum: NOTIFICATION_TYPE })
  type: NOTIFICATION_TYPE;

  @Column({ length: 150 })
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "jsonb", nullable: true })
  data?: Record<string, any>;

  @Column({ name: "is_read", default: false })
  isRead: boolean;

  @Column({ name: "read_at", type: "timestamp", nullable: true })
  readAt?: Date;
}
