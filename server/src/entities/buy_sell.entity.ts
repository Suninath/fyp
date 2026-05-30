import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";
import { VehicleEntity } from "./vehicle.entity";

@Entity("buy_sell")
export class BuySellEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  buyer: UserEntity;

  @Column({ name: "buyer_id" })
  buyerId: number;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  seller: UserEntity;

  @Column({ name: "seller_id" })
  sellerId: number;

  @ManyToOne(() => VehicleEntity, { onDelete: "CASCADE" })
  vehicle: VehicleEntity;

  @Column({ name: "vehicle_id" })
  vehicleId: number;

  @Column({ type: "numeric", precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column({ name: "transaction_id", length: 255, nullable: true })
  transactionId?: string;

  @Column({ length: 50, nullable: true })
  status?: string;
}