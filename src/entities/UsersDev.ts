import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity("UsersDev")
@ObjectType("UsersDev", {description : "User's Dev List"})
class UsersDev extends BaseEntity {
  @PrimaryColumn()
  @Field({ description: "Roll-Number" })
  roll: string;

  @Column()
  @Field({ description: "Password" })
  pass: string;
}

export default UsersDev;
