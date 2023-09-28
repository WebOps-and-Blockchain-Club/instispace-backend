import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from '../course.entity';
import { User } from 'src/user/user.entity';

@Entity('Feedback')
@ObjectType()
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  createdAt: Date;

  @Column()
  @Field()
  review: string;

  @Column()
  @Field()
  profName: string;

  @Column()
  @Field(() => Int)
  rating: number;

  @Column()
  @Field()
  courseName:string;


  @Column()
  @Field()
  courseCode:string;

  @ManyToOne(() => User, (user) => user.courseFeedback, {
  })
  @Field(() => User)
  createdBy: User;


  // @ManyToOne(() => Course, (course) => course.feedbacks)
  // @Field(() => Course)
  // course: Course;
}
