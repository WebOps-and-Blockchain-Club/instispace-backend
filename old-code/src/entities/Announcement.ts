import { EditDelPermission } from "../utils";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
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
  @Field({ description: "Unique uuid generated for each announcement" })
  id: string;

  @Column()
  @Field({ description: "Announcement's Title" })
  title: string;

  @Column()
  @Field({
    description: "Announcement's Description, text",
  })
  description: string;

  @Column({ type: "text", nullable: true })
  @Field((_type) => String, {
    description: "Image description for announcement",
    nullable: true,
  })
  images?: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  createdAt: Date;

  @Column({ type: "timestamptz" })
  @Field(() => Date)
  endTime: Date;

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, {
    description: "Visiblity state of announcements",
  })
  isHidden: boolean;

  @ManyToOne((_type) => User, (user) => user.announcements, { cascade: true })
  @Field((_type) => User, { description: "User who created the announcement" })
  user: User;

  @ManyToMany((_type) => Hostel, (hostels) => hostels.announcements, {
    cascade: true,
  })
  @JoinTable()
  @Field((_type) => [Hostel], {
    description: "Hostels on which the announcement needs to be diplayed",
  })
  hostels: Hostel[];

  @Field(() => [EditDelPermission], { nullable: true })
  permissions: EditDelPermission[];
}

export default Announcement;
