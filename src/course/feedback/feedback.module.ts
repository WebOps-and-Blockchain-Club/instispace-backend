import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackResolver } from './feedback.resolver';
import { CourseModule } from '../course.module';
import { Feedback } from './feedback.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [FeedbackResolver, FeedbackService],
  imports: [TypeOrmModule.forFeature([Feedback]), CourseModule],
})
export class FeedbackModule {}
