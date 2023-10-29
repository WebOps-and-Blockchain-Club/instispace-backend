import { InputType, Int, Field } from '@nestjs/graphql';
import { menuType } from '../enum/menu-type.enum';
import { weekType } from '../enum/week-type.enum';
import { Day } from '../enum/day.enum';

@InputType()
export class CreateMenuInput {
  @Field()
  menuType: menuType;

  @Field()
  weekType: weekType;

  @Field()
  day: Day;

  @Field(() => [String])
  item: string[];
}
