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

  @ManyToOne(() => Netop, (Netop) => Netop.reports, { nullable: true })
  netop: Netop;

  @ManyToOne(() => Query, (Query) => Query.reports, { nullable: true })
  query: Query;

  @ManyToOne(() => User, (User) => User.reports)
  createdBy: User;

  @Column()
  @Field()
  description: string;
}

export default Report;
