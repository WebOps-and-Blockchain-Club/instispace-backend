import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CalendarService } from './calendar.service';
import { Calendar } from './calendar.entity';
import { CreateCalendarInput } from './type/create-calendar.input';
import { UpdateCalendarInput } from './type/update-calendar.input';

@Resolver(() => Calendar)
export class CalendarResolver {
  constructor(private readonly calendarService: CalendarService) {}

  @Mutation(() => Calendar)
  createCalendar(
    @Args('createCalendarInput') createCalendarInput: CreateCalendarInput,
  ) {
    return this.calendarService.create(createCalendarInput);
  }

  @Query(() => [Calendar], { name: 'calendar' })
  findAll() {
    return this.calendarService.findAll();
  }

  @Query(() => Calendar, { name: 'calendar' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.calendarService.findOne(id);
  }

  @Mutation(() => Calendar)
  updateCalendar(
    @Args('updateCalendarInput') updateCalendarInput: UpdateCalendarInput,
  ) {
    return this.calendarService.update(
      updateCalendarInput.id,
      updateCalendarInput,
    );
  }

  @Mutation(() => Calendar)
  removeCalendar(@Args('id', { type: () => Int }) id: number) {
    return this.calendarService.remove(id);
  }
}
