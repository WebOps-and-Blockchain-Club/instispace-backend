import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseResolver } from './course.resolver';
import { Course } from './course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  providers: [CourseResolver, CourseService],
  exports: [CourseService],
})
export class CourseModule {
  constructor() {}
}
