import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Netop from "../Netop";
import User from "../User";

@Entity("Report")
@ObjectType("Report")
class Report extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @ManyToOne(() => Netop, (Netop) => Netop.reports)
  netop: Netop;

  @ManyToOne(() => User, (User) => User.reports)
  by: User;

  @Column()
  @Field()
  description: string;
}

export default Report;
