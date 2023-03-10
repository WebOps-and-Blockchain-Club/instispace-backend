import { CreateCalendarInput } from './create-calendar.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CalendarType } from './calendarType.enum';

@InputType()
export class UpdateCalendarInput extends PartialType(CreateCalendarInput) {
  @Field(() => Date)
  date: Date;

  @Field({ nullable: true })
  description: string;

  @Field(() => [String])
  type: string[];
}
