import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarResolver } from './calendar.resolver';

@Module({
  providers: [CalendarResolver, CalendarService]
})
export class CalendarModule {}
