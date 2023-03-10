import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarResolver } from './calendar.resolver';
import { Calendar } from './calendar.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Calendar])],
  providers: [CalendarResolver, CalendarService],
})
export class CalendarModule {}
