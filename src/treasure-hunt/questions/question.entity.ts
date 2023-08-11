import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Submission } from '../submissions/submission.entity';

@Entity()
@ObjectType()
export class Question {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  description: String;

  @OneToMany((_type) => Submission, (submissions) => submissions.question, {
    nullable: true,
  })
  submissions: Submission[];

  @Column({ type: "text", nullable: true })
  @Field((_type) => String, { nullable: true })
  images?: string | null;
}
