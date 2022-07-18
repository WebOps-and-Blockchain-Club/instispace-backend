import { Field, ObjectType, registerEnumType } from "type-graphql";
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
import { ReportStatus } from "../../utils";

registerEnumType(ReportStatus, { name: "ReportStatus" });

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

  @Column("enum", { enum: ReportStatus, default: ReportStatus.REPORTED })
  @Field((_type) => ReportStatus, {
    description: "Visiblity state of reports",
  })
  status: ReportStatus;

  @CreateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  createdAt: Date;
}

export default Report;
