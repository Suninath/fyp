import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";

@Entity("saved_alerts")
@Index(["userId", "createdAt"])
export class SavedAlertEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "user_id" })
  user?: UserEntity;

  @Column({ name: "user_id", nullable: true })
  userId?: number;

  @Column({ name: "vehicle_id", type: "varchar", length: 100 })
  vehicleId: string;

  @Column({ length: 150, nullable: true })
  name?: string;

  @Column({ type: "jsonb", nullable: true })
  criteria?: Record<string, any>;
}
