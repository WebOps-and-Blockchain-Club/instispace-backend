import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Star from "./Common/Star";
import User from "./User";
import Comment from "./Common/Comment";

/*
"id" varchar
  "created_by" varchar [ref: > user.id]
  "title" varchar
  content varchar
  stars varchar [ref: < star.post] // one to many 
  "photo" varchar
  "tag" varchar
  created_at datetime
  likes int [ref: < Like.id]
  noOfLikes int
  comments varchar [ref: < comment.id]
  reports varchar [ref: < Report.id]
*/

@Entity("NetwokingAndOpporunity")
@ObjectType("NetwokingAndOpporunity")
class NetwokingAndOpporunity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.networking_and_opportunities)
  createdBy: User;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  content: string;

  @OneToMany(() => Star, (star) => star.post)
  stars: Star[];

  @Column()
  @Field()
  photo: string;

  //tags

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  //likes
  @OneToMany(() => User, (user) => user.likedNetwokingAndOpporunity)
  liked_by: User;

  @Column()
  @Field()
  noOfLikes: number;

  //comments
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  //reports
  @OneToMany(() => User, (user) => user.reportedNetwokingAndOpporunity)
  reported_by: User;

  @Column()
  @Field()
  isHidden: boolean;
}

export default NetwokingAndOpporunity;
