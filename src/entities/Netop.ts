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

@Entity("Netop")
@ObjectType("Netop", { description: "networking and opportunity" })
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

  @Column({ type: "timestamptz" })
  @Field({
    description: "time at which this network and opportunity will be end",
  })
  endTime: number;

  //likes
  @ManyToMany(() => User, (user) => user.likedNetop, { nullable: true })
  @JoinTable()
  likedBy: User[];

  @Field(() => Number, { description: "number of likes" })
  likeCount: number;

  //comments
  @OneToMany(() => Comment, (comment) => comment.netop, { nullable: true })
  comments: Comment[];

  //reports
  @ManyToMany(() => User, (user) => user.reportedNetop, { nullable: true })
  @JoinTable()
  reportedBy: User[];

  @ManyToMany(() => User, (user) => user.staredNetop, { nullable: true })
  @JoinTable()
  staredBy: User[];

  @Column()
  @Field()
  isHidden: boolean;

  @ManyToMany((_type) => Tag, (tag) => tag.Netops, { nullable: true })
  @JoinTable()
  tags: Tag[];
}

export default Netop;
