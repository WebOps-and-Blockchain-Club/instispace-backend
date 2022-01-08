import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Netop from "../Netop";
import User from "../User";

@Entity("Comment")
@ObjectType("Comment")
class Comment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @ManyToOne(() => Netop, (Netop) => Netop.comments)
  netop: Netop;

  @ManyToOne(() => User, (User) => User.comments)
  createdBy: User;

  @Column()
  @Field()
  content: string;
}

export default Comment;
