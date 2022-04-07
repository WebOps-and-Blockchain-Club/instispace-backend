import { Category } from "../utils/index";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import User from "./User";

@Entity("Item")
@ObjectType("Item")
class Item extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Unique uuid generated for each Item" })
  id: string;

  @Column("enum", { enum: Category })
  @Field((__type) => Category, {
    description: "Item's status, descibes whether the item is Lost or Found",
  })
  category: Category;

  @Column()
  @Field({ description: "Name of the Lost/Found Item" })
  name: string;

  @Column()
  @Field({ description: "Item's Location" })
  location: string;

  @Column({ type: "timestamptz" })
  @Field(() => Date, {
    description: "Time at which item is lost or found",
  })
  time: Date;

  @Column({ nullable: true })
  @Field({ description: "Item's Images", nullable: true })
  images?: string;

  @CreateDateColumn({ type: "timestamptz" })
  @Field(() => Date, {
    description: "Date at which writer sent the item request",
  })
  createdAt: Date;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "Contact Number of User" })
  contact: string;

  @ManyToOne((_type) => User, (user) => user.items, { cascade: true })
  @Field((_type) => User, { description: "Item's User" })
  user: User;

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, {
    description:
      "Item's Status, describes whether the issue is resolved or not",
  })
  isResolved: boolean;
}

export default Item;
