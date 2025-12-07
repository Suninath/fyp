import { Column, Entity } from "typeorm";
import { BaseEntity } from "../utils/base.entity.js";
import { USER_ROLE } from "../constant/enums.js";


Entity()
class userEnity extends BaseEntity{
@Column({name:"first_name"})
firstname

@Column({name:"last_name"})
lastname

@Column({unique:true})
email

@Column({unique:true})
phonenumber

@Column()
password

@Column({type:"enum",enum:USER_ROLE ,default:USER_ROLE?.USER})
role
}

export default userEnity