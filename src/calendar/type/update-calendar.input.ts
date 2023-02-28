import { CreateCalendarInput } from './create-calendar.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCalendarInput extends PartialType(CreateCalendarInput) {
  @Field(() => Int)
  id: number;
}
