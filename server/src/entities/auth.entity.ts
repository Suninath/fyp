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

  @Column({ default: false })
  verified: boolean;

  @Column({ name: "is_blocked", default: false })
  isBlocked: boolean;

  @OneToOne(() => UserEntity, user => user.auth)
  @JoinColumn({ name: "user_id" }) // 🔑 FK HERE
  user: UserEntity;
}
