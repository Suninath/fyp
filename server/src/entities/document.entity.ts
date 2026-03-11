import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { UserEntity } from "./user.entity";

export enum DOCUMENT_TYPE {
  CITIZENSHIP = "Citizenship",
  NATIONAL_CARD = "National Card",
  PANCARD = "PAN Card",
  COMPANY_REGISTRATION = "Company Registration",
}

export enum VERIFICATION_STATUS {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

@Entity("documents")
export class DocumentEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.documents, { 
    onDelete: "CASCADE",
    eager: false 
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ type: "enum", enum: DOCUMENT_TYPE })
  documentType: DOCUMENT_TYPE;

  @Column({ type: "text" })
  documentUrl: string;

  @Column({ type: "enum", enum: VERIFICATION_STATUS, default: VERIFICATION_STATUS.PENDING })
  verificationStatus: VERIFICATION_STATUS;

  @Column({ name: "verified_by", nullable: true })
  verifiedBy?: number; // admin user id

  @Column({ name: "verified_at", type: "timestamp", nullable: true })
  verifiedAt?: Date;

  @Column({ name: "rejection_reason", nullable: true, type: "text" })
  rejectionReason?: string;
}
