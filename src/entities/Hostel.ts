import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";

@Entity("Hostel")
@ObjectType("Hostel")
class Hostel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  name: string;

  @OneToMany((_type) => User, (users) => users.hostel, { cascade: true })
  @Field((_type) => [User], { nullable: true })
  users: User[];
}

export default Hostel;
