import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Reason")
@ObjectType("Reason")
class Reason extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column()
  @Field({ description: "Reason for the post bieng reported" })
  reason: string;

  @Column({ type: "float", nullable: true })
  @Field(() => Number, {
    description: "Reports severity count",
    nullable: true,
  })
  count: number;
}

export default Reason;
