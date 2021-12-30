import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("FloodData")
@ObjectType("FloodData")
export class FloodData extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  location: string;

  @Column()
  @Field()
  depth: string;

  @UpdateDateColumn()
  @Field()
  time: string;

  @Column()
  @Field()
  image: string;
}
