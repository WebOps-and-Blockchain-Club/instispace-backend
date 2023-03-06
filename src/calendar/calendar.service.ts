import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
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
    let type = createCalendarInput.type.join(' && ');
    newEntry.type = type;
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
        entryList = entryList.filter((e) =>
          e.type
            .toLowerCase()
            .includes(calendarFilteringConditions.type.toLowerCase()),
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

  async populateCalendar(csvUrl: string) {
    let x;
    try {
      x = await axios.get(csvUrl);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
    let data = x.data;
    const list = data.split('\n');
    var final: string[][] = [];
    await Promise.all(
      list.map(async (item) => {
        let arr = item.split(',');
        final.push(arr);
      }),
    );
    final.shift();

    for (const x of final) {
      let newEntry = new Calendar();
      let entryDate = x[0]?.replace(/"/g, '');
      console.log(entryDate);
      let date;
      if (entryDate !== '') {
        date = new Date(
          entryDate.slice(3, 5) +
            '-' +
            entryDate.slice(0, 2) +
            '-' +
            entryDate.slice(6, 10),
        );
        date.setHours(0, 0, 0);
        newEntry.date = date;
      }
      if (x[2]?.replace(/"/g, '') !== '')
        newEntry.type = x[2]?.replace(/"/g, '');
      if (x[1]?.replace(/"/g, '') !== '')
        newEntry.description = x[1]?.replace(/"/g, '');
      console.log(newEntry);
      if (newEntry) await this.calendarRepository.save(newEntry);
    }
    return 'entries added successfully';
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
