import { Entity, Column, ManyToOne, Check } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";
import { VehicleEntity } from "./vehicle.entity";

@Entity("review")
export class ReviewEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  reviewer: UserEntity;

  @Column({ name: "reviewer_id" })
  reviewerId: number;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  reviewee: UserEntity;

  @Column({ name: "reviewee_id" })
  revieweeId: number;

  @ManyToOne(() => VehicleEntity, { onDelete: "CASCADE" })
  vehicle: VehicleEntity;

  @Column({ name: "vehicle_id" })
  vehicleId: number;

  @Column({ type: "int" })
  @Check(`"rating" >= 1 AND "rating" <= 5`)
  rating: number;

  @Column({ type: "text", nullable: true })
  comment?: string;
}