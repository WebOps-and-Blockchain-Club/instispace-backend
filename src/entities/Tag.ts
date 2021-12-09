import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import User from "./User";

@Entity("Tag")
@ObjectType("Tag")
class Tag extends BaseEntity {
  @PrimaryGeneratedColumn() // add uuid here
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  title: string;

  @ManyToMany((_type) => User, (users) => users.interest, { cascade: true })
  @JoinTable()
  @Field((_type) => [User], { nullable: true })
  users: [User];

  // @ManyToMany(_type => event, event => event.Tags, {cascade :true})
  // @JoinTable()
  // @Field(_type =>  [event])
  // events : event[];
}

export default Tag;
