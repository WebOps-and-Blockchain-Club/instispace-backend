import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Netop from "../Netop";
import Query from "../MyQuery";
import User from "../User";

@Entity("Report")
@ObjectType("Report")
class Report extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @ManyToOne(() => Netop, (netop) => netop.reports)
  netop: Netop;

  @ManyToOne(() => Query, (Query) => Query.reports)
  query: Query;

  @ManyToOne(() => User, (User) => User.reports)
  createdBy: User;

  @Column()
  @Field()
  description: string;
}

export default Report;
