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
@ObjectType("Tag", { description: "Tag Entity, Users will follow these tags" })
class Tag extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Unique uuid generated for each Tag" })
  id: string;

  @Column({ unique: true })
  @Field({ description: "Tag's Title" })
  title: string;

  @ManyToMany((_type) => User, (users) => users.interest, { cascade: true })
  @JoinTable()
  @Field((_type) => [User], {
    nullable: true,
    description: "User's That follow that Tag",
  })
  users: [User];

  // @ManyToMany(_type => event, event => event.Tags, {cascade :true})
  // @JoinTable()
  // @Field(_type =>  [event])
  // events : event[];
}

export default Tag;
