import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CalendarService } from './calendar.service';
import { Calendar } from './calendar.entity';
import { CreateCalendarInput } from './type/create-calendar.input';
import { UpdateCalendarInput } from './type/update-calendar.input';
import { CalendarFilteringConditions } from './type/calendar.filteringConditions';
import getCalendarEntryOutput from './type/getCalendar.output';

@Resolver(() => Calendar)
export class CalendarResolver {
  constructor(private readonly calendarService: CalendarService) {}

  @Mutation(() => Calendar)
  async createCalendarEntry(
    @Args('createCalendarInput') createCalendarInput: CreateCalendarInput,
  ) {
    return await this.calendarService.create(createCalendarInput);
  }

  @Query(() => getCalendarEntryOutput)
  getCalendarEntry(
    @Args('calendarFilteringConditions')
    calendarFilteringConditions: CalendarFilteringConditions,
    @Args('take')
    take: number,
    @Args('lastEntryId')
    lastEntryId: string,
  ) {
    return this.calendarService.findAll(
      calendarFilteringConditions,
      take,
      lastEntryId,
    );
  }

  @Mutation(() => String)
  populateCalendar(@Args('csvUrl') csvUrl: string) {
    return this.calendarService.populateCalendar(csvUrl);
  }
}
