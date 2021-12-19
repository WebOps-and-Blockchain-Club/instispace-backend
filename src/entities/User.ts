import { UserRole } from "../utils";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
} from "typeorm";
import Tag from "./Tag";
import Hostel from "./Hostel";

@Entity("User")
@ObjectType("User")
class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  roll: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  name: string;

  @Column({ nullable: true })
  password: string;

  @Column("enum", { enum: UserRole, default: UserRole.USER })
  @Field(() => UserRole)
  role: UserRole;

  @Column({ type: "boolean" })
  @Field((_type) => Boolean)
  isNewUser: Boolean;

  @ManyToOne((_type) => Hostel, (hostel) => hostel.users, { nullable: true })
  @Field({ nullable: true })
  hostel: Hostel;

  @ManyToMany((_type) => Tag, (Tag) => Tag.users, { nullable: true })
  @Field((_type) => [Tag], { nullable: true })
  interest: Tag[];

  // @ManyToMany(_type => event, event => event.liked_by)
  // @Field(_type => [event])
  // events_liked : event[]

  //@oneToMany(_type => event, event => event.created_by)
  //@Field(_type =>[event], {nullable: true})
  //events : event[];
}

export default User;
