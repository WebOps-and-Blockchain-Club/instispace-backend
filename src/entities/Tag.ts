import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import Netop from "./Netop";
import User from "./User";

@Entity("Tag")
@ObjectType("Tag")
class Tag extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  title: string;

  @ManyToMany((_type) => User, (users) => users.interest, { cascade: true })
  @JoinTable()
  @Field((_type) => [User], { nullable: true })
  users: [User];

  @ManyToMany(() => Netop, (Netop) => Netop.tags, { cascade: true })
  Netops: Netop[];
}

export default Tag;
