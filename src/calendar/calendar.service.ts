import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendar } from './calendar.entity';
import { CalendarFilteringConditions } from './type/calendar.filteringConditions';
import { CreateCalendarInput } from './type/create-calendar.input';
import { UpdateCalendarInput } from './type/update-calendar.input';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private calendarRepository: Repository<Calendar>,
  ) {}

  create(createCalendarInput: CreateCalendarInput): Promise<Calendar> {
    let newEntry = new Calendar();
    newEntry.date = createCalendarInput.date;
    newEntry.description = createCalendarInput.description;
    newEntry.type = createCalendarInput.type;
    return this.calendarRepository.save(newEntry);
  }

  async findAll(
    calendarFilteringConditions: CalendarFilteringConditions,
    take: number,
    lastEntryId: string,
  ) {
    let entryList = await this.calendarRepository.find();
    if (calendarFilteringConditions) {
      if (calendarFilteringConditions.from) {
        entryList = entryList.filter(
          (e) => e.date >= calendarFilteringConditions.from,
        );
      }
      if (calendarFilteringConditions.to) {
        entryList = entryList.filter(
          (e) => e.date <= calendarFilteringConditions.to,
        );
      }
      if (calendarFilteringConditions.type) {
        entryList = entryList.filter(
          (e) => e.type === calendarFilteringConditions.type,
        );
      }
    }
    let total = entryList.length;
    let finalList;
    if (lastEntryId) {
      const index = entryList.map((e) => e.id).indexOf(lastEntryId);
      finalList = entryList.splice(index + 1, take);
    } else {
      finalList = entryList.splice(0, take);
    }
    return { list: finalList, total };
  }

  findOne(id: number) {
    return `This action returns a #${id} calendar`;
  }

  update(id: number, updateCalendarInput: UpdateCalendarInput) {
    return `This action updates a #${id} calendar`;
  }

  remove(id: number) {
    return `This action removes a #${id} calendar`;
  }
}
