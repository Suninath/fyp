import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";
import { VehicleEntity } from "./vehicle.entity";

@Entity("comments")
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // The user who made the comment
  @ManyToOne(() => UserEntity, { eager: true })
  user: UserEntity;

  // The vehicle the comment belongs to
  @ManyToOne(() => VehicleEntity, { onDelete: "CASCADE" })
  vehicle: VehicleEntity;

  // Self-referencing relation for nested threaded comments
  @ManyToOne(() => CommentEntity, (comment) => comment.replies, { onDelete: "CASCADE" })
  parent: CommentEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  replies: CommentEntity[];
}
