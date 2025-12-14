import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id = uuidv4();

  @Column({ name: "created_at", type: "timestamp" })
  createdAt = new Date();
}
