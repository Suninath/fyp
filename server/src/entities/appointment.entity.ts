import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";
import { VehicleEntity } from "./vehicle.entity";

@Entity("appointment")
export class AppointmentEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  user: UserEntity;

  @Column({ name: "user_id" })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  seller: UserEntity;

  @Column({ name: "seller_id" })
  sellerId: number;

  @ManyToOne(() => VehicleEntity, { onDelete: "CASCADE" })
  vehicle: VehicleEntity;

  @Column({ name: "vehicle_id" })
  vehicleId: number;

  @Column({ name: "appointment_date", type: "date" })
  appointmentDate: Date;

  @Column({ name: "appointment_time", type: "time" })
  appointmentTime: string;

  @Column({ length: 50, nullable: true })
  status?: string;
}