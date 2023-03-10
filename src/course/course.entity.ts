import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('Course')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  code: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  semester: string;

  @Column()
  @Field()
  venue: string;

  @Column()
  @Field()
  instructorName: string;

  @Column()
  @Field()
  slots: string;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  from: Date;

  @Column({ nullable: true })
  @Field(() => Date, { nullable: true })
  to: Date;
}
