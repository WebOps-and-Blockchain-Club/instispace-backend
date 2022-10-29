import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
 // OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "../User";
import Submission from "./Submission";

@Entity()
@ObjectType()
class Group extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  name: string;

  @Column({ unique: true })
  @Field()
  code: string;

  @Column({ type: "text", array: true })
  order: string[];

  @OneToMany((_type) => User, (users) => users.group)
  users: User[];

  @Column()
  @Field()
  createdBy: string;

  @OneToMany((_type) => Submission, (submission) => submission.group, {
    nullable: true,
  })
  submissions: Submission[];
}

export default Group;
