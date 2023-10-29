import { Day } from '../enum/day.enum';
import { menuType } from '../enum/menu-type.enum';
import { weekType } from '../enum/week-type.enum';
import { CreateMenuInput } from './create-menu.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMenuInput {
  @Field()
  menuType: menuType;

  @Field()
  weekType: weekType;

  @Field()
  day: Day;

  @Field(() => [String])
  item: string[];
}
