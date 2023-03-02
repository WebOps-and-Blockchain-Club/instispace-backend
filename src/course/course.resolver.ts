import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CourseService } from './course.service';
import { Course } from './course.entity';
import { CreateCourseInput } from './type/create-course.input';
import { UpdateCourseInput } from './type/update-course.input';
import { CourseFilteringConditions } from './type/filtering-conditions';
import getCourseOutput from './type/find-course-output';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Mutation(() => Course)
  async createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
  ) {
    return await this.courseService.create(createCourseInput);
  }

  @Query(() => getCourseOutput)
  findAllCourse(
    @Args('courseFilteringConditions')
    courseFilteringConditions: CourseFilteringConditions,
    @Args('take', { type: () => Int }) take: number,
    @Args('lastCourseId') lastCourseId: string,
  ) {
    return this.courseService.findAll(
      courseFilteringConditions,
      take,
      lastCourseId,
    );
  }

  @Query(() => Course, { name: 'course' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.courseService.findOne(id);
  }

  @Mutation(() => Course)
  updateCourse(
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
    @Args('id') id: string,
  ) {
    return this.courseService.update(id, updateCourseInput);
  }

  @Mutation(() => Course)
  removeCourse(@Args('id', { type: () => Int }) id: number) {
    return this.courseService.remove(id);
  }

  @Mutation(() => Boolean)
  Populate_course_db() {
    this.courseService.get_data();
    return true;
  }
}
