import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { USER_ROLE } from "../constant/enums";
import { VehicleEntity } from "./vehicle.entity";

@Entity("users") // table name should match your SQL table
export class UserEntity extends BaseEntity {
  @Column({ name: "firstname", length: 100 })
  firstName: string;

  @Column({ name: "lastname", length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: "phonenumber", length: 50, nullable: true })
  phoneNumber?: string;

  @Column()
  password: string;

  @Column({ type: "enum", enum: USER_ROLE, default: USER_ROLE.USER })
  role: USER_ROLE;

  @Column({ default: false })
  verified: boolean;

  @Column({ name: "profile_image", type: "text", nullable: true })
  profileImage?: string;

  @Column({ type: "timestamp", name: "createdAt", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", name: "updatedAt", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @OneToMany(() => VehicleEntity, vehicle => vehicle.uploader)
  vehicles: VehicleEntity[];
}
