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

@Entity("MyQuery")
@ObjectType("MyQuery", { description: "querys" })
class MyQuery extends BaseEntity {
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

  @Field(() => Number, { description: "number of likes" })
  likeCount: number;

  @OneToMany(() => Comment, (comment) => comment.query, { nullable: true })
  comments: Comment[];

  @OneToMany(() => Report, (report) => report.query, { nullable: true })
  reports: Report[];

  @ManyToMany((_type) => Tag, (tag) => tag.Querys, { nullable: true })
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.querys)
  createdBy: User;

  @ManyToMany(() => User, (user) => user.likedMyQuery, { nullable: true })
  @JoinTable()
  likedBy: User[];
}

export default MyQuery;
