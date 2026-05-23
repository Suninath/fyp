import { Column, Entity, OneToOne, OneToMany } from "typeorm";
import { AuthEntity } from "./auth.entity";
import { BaseEntity } from "../utils/base.entity";
import { DocumentEntity } from "./document.entity";

export enum USER_TYPE {
  INDIVIDUAL = "Individual",
  COMPANY = "Company",
}

@Entity("users")
export class UserEntity extends BaseEntity {
  @Column({ name: "name", length: 100, nullable: true })
  name?: string;

  @Column({ name: "phonenumber", length: 50, nullable: true })
  phoneNumber?: string;

  @Column({ name: "pan_number", length: 50, nullable: true })
  panNumber?: string;

  @Column({ name: "company_registration_doc", type: "text", nullable: true })
  companyRegistrationDoc?: string;

  @Column({ name: "payment_status", default: false })
  paymentStatus: boolean;

  @Column({ name: "profile_image", type: "text", nullable: true })
  profileImage?: string;

  @Column({ name: "is_online", default: false })
  isOnline: boolean;

  @Column({ name: "last_seen", type: "timestamp", nullable: true })
  lastSeen?: Date;

  @Column({ type: "enum", enum: USER_TYPE, default: USER_TYPE.INDIVIDUAL })
  userType: USER_TYPE;

  @OneToOne(() => AuthEntity, (auth) => auth.user)
  auth: AuthEntity;

  @OneToMany(() => DocumentEntity, (document) => document.user, { cascade: true })
  documents: DocumentEntity[];
}
