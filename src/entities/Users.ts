import { UserRole } from "../utils";
import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Users")
@ObjectType("Users")
class Users extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @Field()
  roll: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  name: string;

  @Column("enum", { enum: UserRole, default: UserRole.USER })
  @Field(() => UserRole)
  role: UserRole;
}

export default Users;
