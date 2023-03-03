import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CreateCourseInput } from './type/create-course.input';
import { CourseFilteringConditions } from './type/filtering-conditions';
import { UpdateCourseInput } from './type/update-course.input';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}
  async create(createCourseInput: CreateCourseInput): Promise<Course> {
    // let newCourse = this.courseRepository.create(createCourseInput);
    let newCourse = new Course();
    newCourse.code = createCourseInput.code;
    newCourse.from = createCourseInput.from;
    newCourse.instructorName = createCourseInput.instructorName;
    newCourse.name = createCourseInput.name;
    newCourse.semester = createCourseInput.semester;
    newCourse.to = createCourseInput.to;
    newCourse.venue = createCourseInput.venue;
    let slotList;
    if (createCourseInput.slots && createCourseInput.slots.length) {
      slotList = await createCourseInput.slots.join(' && ');
    }
    newCourse.slots = slotList;
    return this.courseRepository.save(newCourse);
  }

  async findAll(
    filteringConditions: CourseFilteringConditions,
    take: number,
    lastCourseId: string,
  ) {
    let courseList = await this.courseRepository.find();
    if (filteringConditions) {
      if (filteringConditions.date) {
        courseList = courseList.filter(
          (c) =>
            c.from <= filteringConditions.date &&
            filteringConditions.date <= c.to,
        );
      }

      if (filteringConditions.code) {
        courseList = courseList.filter(
          (c) => c.code === filteringConditions.code,
        );
      }

      if (filteringConditions.name) {
        courseList = courseList.filter(
          (c) => c.name === filteringConditions.name,
        );
      }

      if (filteringConditions.semester) {
        courseList = courseList.filter(
          (c) => c.semester === filteringConditions.semester,
        );
      }

      if (filteringConditions.slot) {
        courseList = courseList.filter((c) =>
          c.slots.includes(filteringConditions.slot),
        );
      }
    }
    var finalList;
    const total = courseList.length;

    if (lastCourseId) {
      const index = courseList.map((n) => n.id).indexOf(lastCourseId);
      finalList = courseList.splice(index + 1, take);
    } else {
      finalList = courseList.splice(0, take);
    }
    return { list: finalList, total };
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: string, updateCourseInput: UpdateCourseInput) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }

  async getData(csvUrl: string, to: Date, from: Date, sem: string) {
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
      try {
        let newCourse = new CreateCourseInput();
        console.log(x);
        newCourse.code = x[3].replace(/"/g, '');
        newCourse.instructorName = x[5].replace(/"/g, '');
        newCourse.name = x[4].replace(/"/g, '');
        let slots = x[1]?.replace(/"/g, '').split(',');
        let additionalSlots = x[2]?.replace(/"/g, '').split(',');
        if (!(additionalSlots.length === 1 && additionalSlots[0] === ''))
          slots = slots?.concat(additionalSlots);
        newCourse.slots = slots;
        newCourse.to = to;
        newCourse.from = from;
        newCourse.semester = sem;
        newCourse.venue = x[8].replace(/"/g, '');
        console.log(newCourse);
        await this.create(newCourse);
      } catch (error) {
        throw new Error(`message : ${error}`);
      }
    }
    return 'entries added successfully';
  }
}
