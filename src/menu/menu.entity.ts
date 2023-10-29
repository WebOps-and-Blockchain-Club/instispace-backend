import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { menuType } from './enum/menu-type.enum';
import { weekType } from './enum/week-type.enum';
import { Day } from './enum/day.enum';
registerEnumType(weekType, { name: 'weekType' });
registerEnumType(menuType, { name: 'menuType' });
registerEnumType(Day, { name: 'Day' });

@Entity('Menu')
@ObjectType()
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ nullable: true })
  @Field(() => menuType, { nullable: true })
  menuType: menuType;

  @Column({ nullable: true })
  @Field(() => weekType, { nullable: true })
  weekType: weekType;

  @Column({ nullable: true })
  @Field(() => Day, { nullable: true })
  day: Day;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  item: string;
}
