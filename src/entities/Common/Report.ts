import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
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

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, {
    description: "Visiblity state of reports",
  })
  isResolved: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  @Field()
  createdAt: Date;
}

export default Report;
