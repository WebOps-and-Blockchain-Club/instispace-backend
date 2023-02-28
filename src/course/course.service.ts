import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
}
