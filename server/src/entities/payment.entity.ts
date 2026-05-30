import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { BookingEntity } from "./booking.entity";

export enum PAYMENT_METHOD {
  ESEWA = "eSewa",
  KHALTI = "Khalti",
}

export enum PAYMENT_STATUS {
  PENDING = "Pending",
  SUCCESS = "Success",
  FAILED = "Failed",
  CANCELLED = "Cancelled",
  REFUNDED = "Refunded",
}

@Entity("payment")
export class PaymentEntity extends BaseEntity {
  @ManyToOne(() => BookingEntity, (booking) => booking.payments)
  booking: BookingEntity;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: PAYMENT_METHOD,
  })
  method: PAYMENT_METHOD;

  @Column({
    type: "enum",
    enum: PAYMENT_STATUS,
    default: PAYMENT_STATUS.PENDING,
  })
  status: PAYMENT_STATUS;

  @Column({ length: 255, nullable: true })
  transactionId?: string;

  @Column({ length: 255, nullable: true, unique: true })
  transactionUuid?: string;

  @Column({ type: "text", nullable: true })
  response?: string;

  @Column({ type: "timestamp", nullable: true })
  paidAt?: Date;

  @Column({ length: 255, nullable: true })
  refundId?: string;

  @Column({ type: "numeric", precision: 12, scale: 2, nullable: true })
  refundAmount?: number;

  @Column({ type: "timestamp", nullable: true })
  refundedAt?: Date;

  @Column({ type: "int", nullable: true, default: 0 })
  attemptCount?: number;

  @Column({ type: "timestamp", nullable: true })
  lastAttemptedAt?: Date;
}
