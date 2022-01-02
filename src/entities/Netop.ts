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
import Report from "./Common/Report";

@Entity("Netop")
@ObjectType("Netop", { description: "networking and opportunity" })
class Netop extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

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

  // @Column({ type: "timestamptz" })
  // @Field({
  //   description: "time at which this network and opportunity will be end",
  // })
  // endTime: number;

  //likes
  @ManyToMany(() => User, (user) => user.likedNetop, { nullable: true })
  @JoinTable()
  likedBy: User[];

  @Field(() => Number, { description: "number of likes" })
  likeCount: number;

  @Field(() => Boolean, { description: "is this netop is stared" })
  isStared: boolean;

  @Column()
  @Field()
  isHidden: boolean;

  //comments
  @OneToMany(() => Comment, (comment) => comment.netop, { nullable: true })
  comments: Comment[];

  //reports
  @OneToMany(() => Report, (report) => report.netop, { nullable: true })
  reports: Report[];

  @ManyToMany(() => User, (user) => user.staredNetop, { nullable: true })
  @JoinTable()
  staredBy: User[];

  @ManyToMany((_type) => Tag, (tag) => tag.Netops, { nullable: true })
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.networkingAndOpportunities)
  createdBy: User;
}

export default Netop;
