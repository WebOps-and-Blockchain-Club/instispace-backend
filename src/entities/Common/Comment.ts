import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Netop from "../Netop";
import Query from "../MyQuery";
import User from "../User";

@Entity("Comment")
@ObjectType("Comment")
class Comment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @ManyToOne(() => Netop, (Netop) => Netop.comments, { nullable: true })
  netop: Netop;

  @ManyToOne(() => Query, (Query) => Query.comments, { nullable: true })
  query: Query;

  @ManyToOne(() => User, (User) => User.comments)
  createdBy: User;

  @Column()
  @Field()
  content: string;

  @Column({ type: "text", nullable: true })
  @Field((_type) => String, { nullable: true })
  images?: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  createdAt: Date;
}

export default Comment;
