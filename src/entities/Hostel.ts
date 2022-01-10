import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";

@Entity("Hostel")
@ObjectType("Hostel", { description: "Hostel entity" })
class Hostel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Unique uuid generated for each Hostel" })
  id: string;

  @Column({ unique: true })
  @Field({ description: "Hostel's name" })
  name: string;

  @OneToMany((_type) => User, (users) => users.hostel, { cascade: true })
  @JoinTable()
  @Field((_type) => [User], {
    nullable: true,
    description: "Residents of The Hostel",
  })
  users: User[];
}

export default Hostel;
