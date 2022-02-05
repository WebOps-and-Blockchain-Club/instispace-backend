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

@Entity("Event")
@ObjectType("Event")
class Event extends BaseEntity {
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

  @Column()
  @Field()
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

  @ManyToMany(() => User, (user) => user.staredEvent, {
    nullable: true,
  })
  @JoinTable()
  staredBy: User[];

  @ManyToMany((_type) => Tag, (tag) => tag.event, {
    nullable: true,
    cascade: true,
  })
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.event)
  createdBy: User;

  @ManyToMany(() => User, (user) => user.likedEvent, { nullable: true })
  @JoinTable()
  likedBy: User[];
}

export default Event;
