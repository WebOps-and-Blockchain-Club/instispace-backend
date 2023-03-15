import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CalendarType } from './type/calendarType.enum';

registerEnumType(CalendarType, { name: 'CalendarType' });

@Entity('Calendar')
@ObjectType()
export class Calendar {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ unique: true })
  @Field(() => Date)
  date: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column()
  @Field()
  type: string;
}
