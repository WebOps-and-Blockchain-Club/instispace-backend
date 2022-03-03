import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";

@Entity("Feedback")
@ObjectType("Feedback")
class Feedback extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Auto generated uuid for a feedback" })
  id: string;

  @ManyToOne((_type) => User, (user) => user.feedbacks, { cascade: true })
  @Field((_type) => User, { description: "User who added this feedback" })
  user: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Field({ nullable: true, description: "answer to question-1" })
  @Column({ nullable: true })
  ans1: string;

  @Field({ nullable: true, description: "answer to question-2" })
  @Column({ nullable: true })
  ans2: string;

  @Field({ nullable: true, description: "answer to question-3" })
  @Column({ nullable: true })
  ans3: string;
}

export default Feedback;
