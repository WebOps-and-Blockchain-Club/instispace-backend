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
  @Field()
  id: string;

  @CreateDateColumn({ type: "timestamptz" })
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  content: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  attachments: string;

  @Column()
  @Field()
  isHidden: boolean;

  @Column({ type: "timestamptz" })
  @Field(() => Date)
  endTime: Date;

  @Field(() => Number, { description: "number of likes" })
  likeCount: number;

  @Field(() => Boolean, { description: "is this netop is stared" })
  isStared: boolean;

  @OneToMany(() => Comment, (comment) => comment.netop, { nullable: true })
  comments: Comment[];

  @OneToMany(() => Report, (report) => report.netop, { nullable: true })
  reports: Report[];

  @ManyToMany(() => User, (user) => user.staredNetop, { nullable: true })
  @JoinTable()
  staredBy: User[];

  @ManyToMany((_type) => Tag, (tag) => tag.Netops, { nullable: true })
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.networkingAndOpportunities)
  @Field()
  createdBy: User;

  @ManyToMany(() => User, (user) => user.likedNetop, { nullable: true })
  @JoinTable()
  likedBy: User[];
}

export default Netop;
