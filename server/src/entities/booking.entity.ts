import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";
import { VehicleEntity } from "./vehicle.entity";
import { PaymentEntity } from "./payment.entity";

export enum BOOKING_STATUS {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  CANCELLED = "Cancelled",
  COMPLETED = "Completed",
}

@Entity("booking")
export class BookingEntity extends BaseEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => VehicleEntity)
  vehicle: VehicleEntity;

  @Column({ type: "timestamp" })
  startDate: Date;

  @Column({ type: "timestamp" })
  endDate: Date;

  @Column({ length: 100 })
  location: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  dailyRate: number;

  @Column({ type: "int" })
  numberOfDays: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: "numeric", precision: 12, scale: 2, nullable: true })
  discount?: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  finalAmount: number;

  @Column({
    type: "enum",
    enum: BOOKING_STATUS,
    default: BOOKING_STATUS.PENDING,
  })
  status: BOOKING_STATUS;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @OneToMany(() => PaymentEntity, (payment) => payment.booking)
  payments: PaymentEntity[];
}
