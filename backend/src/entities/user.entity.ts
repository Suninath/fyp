import { Column, Entity } from "typeorm";
import { BaseEntity } from "../utils/base.entity";
import { USER_ROLE } from "../constant/enums";


@Entity("User")
export class userEnity extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  password: string;

  @Column({ type: "enum", enum: USER_ROLE, default: USER_ROLE.USER })
  role: USER_ROLE;
}
