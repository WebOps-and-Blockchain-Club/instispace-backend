import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from '../course.entity';

@Entity('Feedback')
@ObjectType()
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  review: string;

  @Column()
  @Field()
  profName: string;

  @Column()
  @Field(() => Int)
  rating: number;

  @ManyToOne(() => Course, (course) => course.feedbacks)
  @Field(() => Course)
  course: Course;
}
