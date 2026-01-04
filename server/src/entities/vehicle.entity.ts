import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";

@Entity("vehicle")
export class VehicleEntity extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  make: string;

  @Column({ length: 100 })
  model: string;

  @Column({ type: "int" })
  year: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  price: number;

  @Column({ type: "int", nullable: true })
  mileage?: number;

  @Column({ length: 50, nullable: true })
  fuelType?: string;

  @Column({ length: 50, nullable: true })
  transmission?: string;

  @Column({ length: 50, nullable: true })
  color?: string;

  @Column({ length: 100, nullable: true })
  location?: string;

  @Column({ length: 50, nullable: true })
  condition?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "text", array: true, nullable: true })
  images?: string[];

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  uploader: UserEntity;
}