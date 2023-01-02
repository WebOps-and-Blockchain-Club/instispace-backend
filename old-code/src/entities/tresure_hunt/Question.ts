import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Submission from "./Submission";

@Entity()
@ObjectType()
class Question extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  description: String;

  @OneToMany((_type) => Submission, (submissions) => submissions.question, {
    nullable: true,
  })
  submissions: Submission[];

  @Column({ type: "text", nullable: true })
  @Field((_type) => String, { nullable: true })
  images?: string | null;
}
export default Question;
