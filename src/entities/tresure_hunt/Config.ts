import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
class Group extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "float" })
  @Field(() => Number)
  minMembers: number;

  @Column({ type: "float" })
  @Field(() => Number)
  maxMembers: number;

  @Column({ type: "timestamptz" })
  @Field(() => Date)
  startTime: Date;

  @Column({ type: "timestamptz" })
  @Field(() => Date)
  endTime: Date;
}

export default Group;
