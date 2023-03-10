import { Field, InputType } from '@nestjs/graphql';
import { CalendarType } from './calendarType.enum';

@InputType()
export class CalendarFilteringConditions {
  @Field(() => Date, { nullable: true })
  from: Date;

  @Field(() => Date, { nullable: true })
  to: Date;

  @Field((_type) => CalendarType,{nullable:true})
  type: CalendarType;
}
