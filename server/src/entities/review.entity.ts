import { Entity, Column, ManyToOne, Check, Unique } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";
import { VehicleEntity } from "./vehicle.entity";
import { BookingEntity } from "./booking.entity";

@Entity("review")
@Unique(["booking"]) // One review per booking
export class ReviewEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  reviewer: UserEntity;

  @Column({ name: "reviewer_id" })
  reviewerId: number;

  @ManyToOne(() => VehicleEntity, { onDelete: "CASCADE" })
  vehicle: VehicleEntity;

  @Column({ name: "vehicle_id" })
  vehicleId: number;

  @ManyToOne(() => BookingEntity, { onDelete: "CASCADE" })
  booking: BookingEntity;

  @Column({ name: "booking_id" })
  bookingId: number;

  @Column({ type: "int" })
  @Check(`"rating" >= 1 AND "rating" <= 5`)
  rating: number;

  @Column({ type: "text", nullable: true })
  comment?: string;

  @Column({ type: "text", nullable: true })
  title?: string;
}