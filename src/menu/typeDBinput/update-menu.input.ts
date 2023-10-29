import { Day } from '../enum/day.enum';
import { menuType } from '../enum/menu-type.enum';
import { weekType } from '../enum/week-type.enum';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

export class UpdateMenuDBInput {
  @Field(() => menuType)
  menuType: menuType;

  @Field(() => weekType)
  weekType: weekType;

  @Field(() => Day)
  day: Day;

  @Field()
  item: string;
}
