import { UserRole } from "../utils";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import NetwokingAndOpporunity from "./Netwoking_and_opporunity";
import Star from "./Common/Star";
import Comment from "./Common/Comment";

@Entity("User")
@ObjectType("User")
class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @Field()
  roll: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  name: string;

  @Column("enum", { enum: UserRole, default: UserRole.USER })
  @Field(() => UserRole)
  role: UserRole;

  // networking and opportunity

  @OneToMany(
    () => NetwokingAndOpporunity,
    (netwokingAndOpporunity) => netwokingAndOpporunity.created_by
  )
  networking_and_opportunities: NetwokingAndOpporunity[];

  @OneToMany(() => Star, (star) => star.user)
  stars: Star[];

  @OneToMany(
    () => NetwokingAndOpporunity,
    (netwokingAndOpporunity) => netwokingAndOpporunity.liked_by
  )
  likedNetwokingAndOpporunity: NetwokingAndOpporunity[];

  @OneToMany(
    () => NetwokingAndOpporunity,
    (netwokingAndOpporunity) => netwokingAndOpporunity.reported_by
  )
  reportedNetwokingAndOpporunity: NetwokingAndOpporunity[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}

export default User;
