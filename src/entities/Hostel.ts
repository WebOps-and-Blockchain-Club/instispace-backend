import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Announcement from "./Announcement";
import User from "./User";

@Entity("Hostel")
@ObjectType("Hostel",{description : "Hostel entity"})
class Hostel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Hostel's id" })
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

  @OneToMany((_type) => Announcement, (announcements) => announcements.hostel, {
    nullable: true,
  })
  @Field((_type) => [Announcement], {
    description:
      "Hostel's Announcement, they will be displayed on the notice board",
  })
  announcements: Announcement[];
}

export default Hostel;
