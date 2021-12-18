import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import NetwokingAndOpporunity from "../Netop";
import User from "../User";

@Entity("Comment")
@ObjectType("Comment")
class Comment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @ManyToOne(
    () => NetwokingAndOpporunity,
    (NetwokingAndOpporunity) => NetwokingAndOpporunity.comments
  )
  post: NetwokingAndOpporunity;

  @ManyToOne(() => User, (User) => User.comments)
  user: User[];

  @Column()
  @Field()
  content: string;
}

export default Comment;
