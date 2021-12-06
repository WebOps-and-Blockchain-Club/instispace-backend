import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import NetwokingAndOpporunity from "../Netwoking_and_opporunity";
import User from "../User";

@Entity("Star")
@ObjectType("Star")
class Star extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @ManyToOne(
    () => NetwokingAndOpporunity,
    (NetwokingAndOpporunity) => NetwokingAndOpporunity.stars
  )
  post: NetwokingAndOpporunity;

  @ManyToOne(() => User, (User) => User.stars)
  user: User[];
}

export default Star;
