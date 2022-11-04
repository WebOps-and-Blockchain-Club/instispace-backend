import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "../User";
import Group from "./Group";
import Question from "./Question";

@Entity()
@ObjectType()
class Submission extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  description: String;

  @CreateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  createdAt: Date;

  @ManyToOne((_type) => Question, (question) => question.submissions)
  question: Question;

  @ManyToOne((_type) => Group, (group) => group.submissions)
  group: Group;

  @ManyToOne((_type) => User, (submittedBy) => submittedBy.submissions)
  @Field((_type) => User)
  submittedBy: User;

  @Column({ type: "text", nullable: true })
  @Field((_type) => String, { nullable: true })
  images?: string | null;
}
export default Submission;
