import { UserRole } from "../utils";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";
import Tag from "./Tag";
import Hostel from "./Hostel";
import Announcement from "./Announcement";

@Entity("User")
@ObjectType("User", {description :"User Entity"})
class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "User's Id" })
  id: string;

  @Column({ unique: true })
  @Field({ description: "Users Email(for Admin)/Roll-Number(for ldpap User)" })
  roll: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "User's name" })
  name: string;

  @Column({ nullable: true })
  password: string;

  @Column("enum", { enum: UserRole, default: UserRole.USER })
  @Field(() => UserRole, { description: "User's role" })
  role: UserRole;

  @Column({ type: "boolean" })
  @Field((_type) => Boolean, {
    description: "This Field determines if User is a new User or not!",
  })
  isNewUser: Boolean;

  @ManyToMany((_type) => Tag, (interest) => interest.users, { nullable: true })
  @Field((_type) => [Tag], {
    nullable: true,
    description: "User's Interest, collection of Tags",
  })
  interest: Tag[];

  @ManyToOne((_type) => Hostel, (hostel) => hostel.users, { nullable: true })
  @Field({ nullable: true, description: "User's Hostel amd its details" })
  hostel: Hostel;

  @OneToMany((_type) => Announcement, (announcements) => announcements.user, {
    nullable: true,
  })
  @Field((_type) => [Announcement], {
    description:
      "Announcements Created by User, can only be created if its a Super User",
  })
  announcements: Announcement[];

  // @ManyToMany(_type => event, event => event.liked_by)
  // @Field(_type => [event])
  // events_liked : event[]

  // @oneToMany(_type => event, event => event.created_by)
  // @Field(_type =>[event], {nullable: true})
  // events : event[];
}

export default User;
