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
import Report from "./Common/Report";
import { EditDelPermission, PostStatus } from "../utils";

@Entity("MyQuery")
@ObjectType("MyQuery", { description: "querys" })
class MyQuery extends BaseEntity {
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

  @Column({ type: "text", nullable: true })
  @Field((_type) => String, { nullable: true })
  attachments: string | null;

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, {
    description: "Visiblity state of query",
  })
  isHidden: boolean;

  @Column("enum", { enum: PostStatus, default: PostStatus.POSTED })
  @Field((_type) => PostStatus, {
    description: "Visiblity state of reports",
  })
  status: PostStatus;

  @Field(() => Number, { description: "number of likes" })
  likeCount: number;

  @Field(() => Number, {
    nullable: true,
    description: "Number of reports for a Netop",
  })
  reportCount: number;

  @OneToMany(() => Comment, (comment) => comment.query, { nullable: true })
  comments: Comment[];

  @OneToMany(() => Report, (report) => report.query, { nullable: true })
  reports: Report[];

  @ManyToOne(() => User, (user) => user.querys)
  createdBy: User;

  @ManyToMany(() => User, (user) => user.likedMyQuery, { nullable: true })
  @JoinTable()
  likedBy: User[];

  @Field(() => [EditDelPermission], { nullable: true })
  permissions: EditDelPermission[];
}

export default MyQuery;
