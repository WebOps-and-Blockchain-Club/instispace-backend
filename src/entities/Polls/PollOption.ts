import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "../User";
import Poll from "./Poll";

@Entity("PollOption")
@ObjectType("PollOption")
class PollOption extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column()
  @Field()
  description: string;

  @ManyToOne((_type) => Poll, (poll) => poll.options, { cascade: true })
  @Field((_type) => Poll, { nullable: true })
  poll: Poll;

  @Field(() => Boolean, { description: "is this netop is liked" })
  isUpvoted: boolean;

  @Field(() => Number, { description: "number of likes" })
  upvoteCount: number;

  @ManyToMany((_type) => User, (upvotedBy) => upvotedBy.pollOptions, {
    nullable: true,
  })
  @Field((_type) => [User], {
    nullable: true,
    description: "People who upvoted a particular option",
  })
  @JoinTable()
  upvotedBy: User[];
}

export default PollOption;
