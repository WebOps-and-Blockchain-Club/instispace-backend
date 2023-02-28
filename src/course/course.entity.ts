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

  @Column()
  @Field()
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

  @CreateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  from: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  to: Date;
}
