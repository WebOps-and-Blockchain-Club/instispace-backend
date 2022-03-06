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

  @Field(() => Netop, { nullable: true })
  @ManyToOne(() => Netop, (netop) => netop.reports, { nullable: true })
  netop: Netop;

  @Field(() => Query, { nullable: true })
  @ManyToOne(() => Query, (Query) => Query.reports, { nullable: true })
  query: Query;

  @Field(() => User)
  @ManyToOne(() => User, (User) => User.reports)
  createdBy: User;

  @Column()
  @Field()
  description: string;

  @Column()
  @Field()
  isHidden: boolean;
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
