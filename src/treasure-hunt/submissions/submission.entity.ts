import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from '../group/group.entity';
import { Question } from '../questions/question.entity';
import { User } from 'src/user/user.entity';

@Entity()
@ObjectType()
export class Submission {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  description: String;

  @CreateDateColumn({ type: "timestamptz" })
  @Field(() => Date)
  createdAt: Date;

  @ManyToOne((_type) => Question, (question) => question.submissions)
  question: Question;

  @ManyToOne((_type) => Group, (group) => group.submissions)
  group: Group;

  @ManyToOne((_type) => User, (submittedBy) => submittedBy.submissions)
  @Field((_type) => User)
  submittedBy: User;

  @Column({ type: "text", nullable: true })
  @Field((_type) => String, { nullable: true })
  images?: string | null;

  
}
