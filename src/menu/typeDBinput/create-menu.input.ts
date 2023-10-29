import { InputType, Int, Field } from '@nestjs/graphql';
import { menuType } from '../enum/menu-type.enum';
import { weekType } from '../enum/week-type.enum';
import { Day } from '../enum/day.enum';


export class CreateMenuDBInput {
  @Field(() => menuType)
  menuType: menuType;

  @Field(() => weekType)
  weekType: weekType;

  @Field(() => Day)
  day: Day;

  @Field()
  item: string;
}
