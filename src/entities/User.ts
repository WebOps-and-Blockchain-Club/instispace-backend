import { UserRole } from "../utils";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToMany,
} from "typeorm";
import Netop from "./Netop";
import Comment from "./Common/Comment";
import Tag from "./Tag";

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

  // networking and opportunity

  @OneToMany(() => Netop, (netop) => netop.createdBy)
  networking_and_opportunities: Netop[];

  @OneToMany(() => Netop, (netop) => netop.likedBy)
  likedNetop: Netop[];

  @OneToMany(() => Netop, (netop) => netop.reportedBy)
  reportedNetop: Netop[];

  @OneToMany(() => Netop, (netop) => netop.staredBy)
  staredNetop: Netop[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
  @Column({ nullable: true })
  @Field({ nullable: true })
  hostel: string;

  @Column({ type: "boolean" })
  @Field((_type) => Boolean)
  isNewUser: Boolean;

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
