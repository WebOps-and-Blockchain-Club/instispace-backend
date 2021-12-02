import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity("UsersDev")
@ObjectType("UsersDev")
class UsersDev extends BaseEntity {
  @PrimaryColumn()
  @Field()
  roll: string;

  @Column()
  @Field()
  pass: string;
}

export default UsersDev;
