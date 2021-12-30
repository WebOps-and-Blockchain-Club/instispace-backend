import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Hostel from "./Hostel";
import User from "./User";

@Entity("Announcement")
@ObjectType("Announcement", {
  description: "Annoucements Entity, It will be diplayed for all hostels",
})
class Announcement extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Announcement's Id" })
  id: string;

  @Column()
  @Field({ description: "Announcement's Title" })
  title: string;

  @Column({ unique: true })
  @Field({
    description: "Announcement's Description, text",
  })
  description: string;

  @Column({ nullable: true })
  @Field({ description: "Image description for announcement" })
  image: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  endTime: number;

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, {
    description: "Visiblity state of announcements",
  })
  isHidden: boolean;

  @ManyToOne((_type) => User, (user) => user.announcements, { cascade: true })
  @JoinTable()
  @Field((_type) => User, { description: "User who created the announcement" })
  user: User;

  @ManyToOne((_type) => Hostel, (hostel) => hostel.announcements, {
    cascade: true,
  })
  @JoinTable()
  @Field((_type) => Hostel, {
    description: "Hostel on which the announcement needs to be diplayed",
  })
  hostel: Hostel;
}

export default Announcement;
