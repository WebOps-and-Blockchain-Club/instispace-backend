import { Field, ObjectType } from '@nestjs/graphql';
import { Calendar } from '../calendar.entity';

@ObjectType('getCalendarEntryOutput')
class getCalendarEntryOutput {
  @Field(() => [Calendar], { nullable: true })
  list: Calendar[];

  @Field(() => Number)
  total: number;
}

export default getCalendarEntryOutput;
