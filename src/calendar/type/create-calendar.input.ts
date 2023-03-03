import { InputType, Int, Field } from '@nestjs/graphql';
import { CalendarType } from './calendarType.enum';

@InputType()
export class CreateCalendarInput {
  @Field(() => Date)
  date: Date;

  @Field()
  description: String;

  @Field((_type) => CalendarType)
  type: CalendarType;
}
