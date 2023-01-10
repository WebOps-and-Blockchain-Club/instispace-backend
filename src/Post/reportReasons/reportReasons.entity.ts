import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity("Reasons")
@ObjectType()
export class ReportReason {
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
