import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { BookingEntity } from "./booking.entity";
import { UserEntity } from "./user.entity";

export enum REFUND_REQUEST_STATUS {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  PROCESSED = "Processed",
}

@Entity("refund_request")
export class RefundRequestEntity extends BaseEntity {
  @ManyToOne(() => BookingEntity)
  booking: BookingEntity;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column({ type: "text" })
  reason: string;

  @Column({ type: "enum", enum: REFUND_REQUEST_STATUS, default: REFUND_REQUEST_STATUS.PENDING })
  status: REFUND_REQUEST_STATUS;

  @Column({ type: "text", nullable: true })
  adminNotes?: string;

  @Column({ type: "timestamp", nullable: true })
  requestedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  processedAt?: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  processedBy?: UserEntity;
}