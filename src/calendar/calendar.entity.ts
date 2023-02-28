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

  @CreateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  date: Date;

  @Column()
  @Field()
  description: String;

  @Column('enum', { enum: CalendarType })
  @Field((_type) => CalendarType)
  type: CalendarType;
}
