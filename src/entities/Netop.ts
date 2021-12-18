import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";
import Comment from "./Common/Comment";
import Tag from "./Tag";

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

@Entity("Netop")
@ObjectType("Netop")
class Netop extends BaseEntity {
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

  @Column()
  @Field()
  photo: string;

  //tags

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  //likes
  @OneToMany(() => User, (user) => user.likedNetop)
  likedBy: User[];

  @Column(() => Number)
  @Field(() => Number)
  likeCount: number;

  //comments
  @OneToMany(() => Comment, (comment) => comment.netop)
  comments: Comment[];

  //reports
  @OneToMany(() => User, (user) => user.reportedNetop)
  reportedBy: User[];

  @OneToMany(() => User, (user) => user.staredNetop)
  staredBy: User[];

  @Column()
  @Field()
  isHidden: boolean;

  @ManyToMany((_type) => Tag, (tag) => tag.Netops)
  @JoinTable()
  tags: Tag[];
}

export default Netop;
