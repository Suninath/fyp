import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";

@Entity("user_otps")
export class UserOtpEntity extends BaseEntity {
  @Column()
  otp: string;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  user: UserEntity;
}
