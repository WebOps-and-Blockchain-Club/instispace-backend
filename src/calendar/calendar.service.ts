import { Injectable } from '@nestjs/common';
import { CreateCalendarInput } from './type/create-calendar.input';
import { UpdateCalendarInput } from './type/update-calendar.input';

@Injectable()
export class CalendarService {
  create(createCalendarInput: CreateCalendarInput) {
    return 'This action adds a new calendar';
  }

  findAll() {
    return `This action returns all calendar`;
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
