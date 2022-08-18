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
import { EditDelPermission } from "../utils";

@Entity("Netop")
@ObjectType("Netop", { description: "networking and opportunity" })
class Netop extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @CreateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  createdAt: Date;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  content: string;

  @Column({ type: "text", nullable: true })
  @Field((_type) => String, { nullable: true })
  photo?: string | null;

  @Column({ nullable: true })
  @Field({ nullable: true })
  attachments: string;

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, {
    description: "Visiblity state of netop",
  })
  isHidden: boolean;

  @Column({ type: "timestamptz" })
  @Field(() => Date)
  endTime: Date;

  @Field(() => Number, { description: "number of likes" })
  likeCount: number;

  @Field(() => Number, { description: "number of likes" })
  commentCount: number;

  @Field(() => Boolean, { description: "is this netop is stared" })
  isStared: boolean;

  @Field(() => Boolean, { description: "is this netop is boolean" })
  isReported: boolean;

  @Field(() => Boolean, { description: "is this netop is liked" })
  isLiked: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  linkToAction: string;

  @OneToMany(() => Comment, (comment) => comment.netop)
  comments: Comment[];

  @OneToMany(() => Report, (report) => report.netop)
  reports: Report[];

  @ManyToMany(() => User, (user) => user.staredNetop)
  @JoinTable()
  staredBy: User[];

  @ManyToMany((_type) => Tag, (tag) => tag.netops)
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.networkingAndOpportunities, {
    cascade: true,
  })
  createdBy: User;

  @ManyToMany(() => User, (user) => user.likedNetop)
  @JoinTable()
  likedBy: User[];

  @Field(() => [EditDelPermission], { nullable: true })
  permissions: EditDelPermission[];
}

export default Netop;
