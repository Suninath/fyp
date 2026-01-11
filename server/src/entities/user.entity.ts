import { Column, Entity, OneToOne } from "typeorm";
import { AuthEntity } from "./auth.entity";
import { BaseEntity } from "../utils/base.entity";

@Entity("users")
export class UserEntity extends BaseEntity {

  @Column({ name: "name", length: 100, nullable: true })
  name?: string;

  @Column({ name: "phonenumber", length: 50, nullable: true })
  phoneNumber?: string;

  @Column({ name: "profile_image", type: "text", nullable: true })
  profileImage?: string;

  @Column({ name: "pan_number", length: 50, nullable: true })
  panNumber?: string;

  @Column({ name: "company_registration_doc", type: "text", nullable: true })
  companyRegistrationDoc?: string;

  @Column({ name: "payment_status", default: false })
  paymentStatus: boolean;

  @OneToOne(() => AuthEntity, (auth) => auth.user)
  auth: AuthEntity;
}
