import { Column, Entity, OneToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { USER_ROLE } from "../constant/enums";
import { UserEntity } from "./user.entity";

@Entity("auth")
export class AuthEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: "enum", enum: USER_ROLE, default: USER_ROLE.USER })
  role: USER_ROLE;

  @Column({ name: "email_verified", default: false })
  emailVerified: boolean;

  @Column({ name: "account_verified", default: false })
  accountVerified: boolean;

  @Column({ name: "is_blocked", default: false })
  isBlocked: boolean;

  @Column({ name: "verification_rejected", default: false })
  verificationRejected: boolean;

  @Column({ name: "rejection_reason", nullable: true })
  rejectionReason?: string;

  @OneToOne(() => UserEntity, user => user.auth)
  @JoinColumn({ name: "user_id" }) // 🔑 FK HERE
  user: UserEntity;
}
