import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";
import Tag from "./Tag";
import { EditDelPermission } from "../utils";

@Entity("Event")
@ObjectType("Event")
class Event extends BaseEntity {
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

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, {
    description: "Visiblity state of announcements",
  })
  isHidden: boolean;

  @Column()
  @Field()
  location: string;

  @Column({ type: "timestamptz" })
  @Field(() => Date)
  time: Date;

  @Field(() => Number, { description: "Total Number of likes for event" })
  likeCount: number;

  @Field(() => Boolean, { description: "Event starred boolean" })
  isStared: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  linkToAction: string;

  @ManyToMany(() => User, (user) => user.staredEvent, { cascade: true })
  @JoinTable()
  staredBy: User[];

  @ManyToMany((_type) => Tag, (tag) => tag.event, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.event, {
    cascade: true,
  })
  createdBy: User;

  @ManyToMany(() => User, (user) => user.likedEvent)
  @JoinTable()
  likedBy: User[];

  @Field(() => [EditDelPermission], { nullable: true })
  permissions: EditDelPermission[];
}

export default Event;
