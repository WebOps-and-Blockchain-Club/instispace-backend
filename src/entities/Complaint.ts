import { ComplaintCategory } from "../utils/index";
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

@Entity("Complaint")
@ObjectType("Complaint")
class Complaint extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Unique uuid generated for each Complaint" })
  id: string;

  @Column()
  @Field({ description: "Complaints Title" })
  title: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "Complaints visual Description" })
  images?: string;

  @Column()
  @Field({ description: "Complaints description" })
  description: string;

  @Column()
  @Field({ description: "Description of the loaction of the issue" })
  location: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Column({ nullable: true })
  @Field({
    nullable: true,
    description: "Written Proof describing complaint's resolution status",
  })
  resolutionDesc?: string;

  @Column({ nullable: true })
  @Field({
    nullable: true,
    description: "Visual Proof describing complaint's resolution status",
  })
  resolutionImg?: string;

  @Field((_type) => Number, {
    nullable: true,
    description: "Describes how many of the user approved this Complaint",
  })
  upvotes?: number;

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, { description: "Complaint resolution status" })
  isResolved: boolean;

  @ManyToOne((_type) => User, (user) => user.complaints, { cascade: true })
  @Field((_type) => User, { description: "Person who raised the issue" })
  user: User;

  @ManyToMany((_type) => User, (upvotedBy) => upvotedBy.complaintsUpvoted, {
    cascade: true,
  })
  @Field((_type) => [User], {
    nullable: true,
    description: "users approving the complaint",
  })
  @JoinTable()
  upvotedBy: User[];

  @Column("enum", { enum: ComplaintCategory })
  @Field(() => ComplaintCategory, {
    description:
      "Category of a Complaint, describes whether the Complaint is a Mess/General/Hostel concern",
  })
  category: ComplaintCategory;
}

export default Complaint;
