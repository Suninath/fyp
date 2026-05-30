import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";
import { VehicleEntity } from "./vehicle.entity";

@Entity("vehicle_view")
@Index(["viewerId", "vehicleId"], { unique: true })
@Index(["vehicleId", "lastViewedAt"])
export class VehicleViewEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "viewer_id" })
  viewer: UserEntity;

  @Column({ name: "viewer_id" })
  viewerId: number;

  @ManyToOne(() => VehicleEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "vehicle_id" })
  vehicle: VehicleEntity;

  @Column({ name: "vehicle_id" })
  vehicleId: number;

  @Column({ name: "view_count", type: "int", default: 1 })
  viewCount: number;

  @Column({ name: "last_viewed_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastViewedAt: Date;
}
