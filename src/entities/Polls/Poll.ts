import { Department, PollType } from "../../utils";
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
import User from "../User";
import PollOption from "./PollOption";
import Hostel from "../Hostel";

@Entity("Poll")
@ObjectType("Poll", { description: "Poll" })
class Poll extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Autogenerated uuid for Poll" })
  id: string;

  @Column()
  @Field({ description: "Question for the Poll" })
  question: string;

  @Column("enum", { enum: Department, default: Department.ALL })
  @Field((_type) => Department, { description: "Department For the Poll" })
  department: Department;

  @Column()
  @Field({ description: "Batch of the students" })
  batch: string;

  @Column("enum", { enum: PollType })
  @Field((_type) => PollType, {
    description:
      "describes whether, Poll is single correct or multi correct type",
  })
  pollType: PollType;

  @Column({ type: Boolean, default: true })
  @Field((_type) => Boolean, { description: "Live Status for the Poll" })
  isLive: boolean;

  @OneToMany((_type) => PollOption, (options) => options.poll)
  @Field((_type) => [PollOption], { description: "Options For the Poll" })
  options: PollOption[];

  @ManyToOne((_type) => User, (createdBy) => createdBy.pollsCreated, {
    cascade: true,
  })
  @Field((_type) => User, { description: "People who Creates the poll" })
  createdBy: User;

  @Field(() => Number, { description: "number of likes" })
  totalAnswers: number;

  @ManyToMany((_type) => User, (answeredBy) => answeredBy.polls, {
    nullable: true,
  })
  @Field((_type) => [User], {
    description: "People who answrered that particular poll",
  })
  @JoinTable()
  answeredBy: User[];

  @ManyToOne((_type) => Hostel, (hostel) => hostel.polls, { nullable: true })
  @Field((_type) => Hostel, {
    nullable: true,
    description: "Hostell On which poll needs to displayed",
  })
  hostel: Hostel;

  @CreateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  createdAt: Date;

  @Column({ type: "float"})
  @Field(() => Number, {
    description: "Duration to which poll needs to be live",
  })
  duration: number;

  @Column({ type: Boolean, default: false })
  @Field(() => Boolean, { description: "Visibility status of Poll" })
  isHidden: boolean;
}

export default Poll;
