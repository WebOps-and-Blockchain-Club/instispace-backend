import { Injectable } from '@nestjs/common';
import { CreateFeedbackInput } from './type/create-feedback.input';
import { UpdateFeedbackInput } from './type/update-feedback.input';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CourseService } from '../course.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    private readonly courseService: CourseService,
  ) {}
  async create(createFeedbackInput: CreateFeedbackInput) {
    let feedback = this.feedbackRepository.create({ ...createFeedbackInput });
    let course = await this.courseService.findOneByCode(
      createFeedbackInput.courseCode,
    );
    console.log(course);
    feedback.course = course;
    return await this.feedbackRepository.save(feedback);
  }

  async findAll() {
    return await this.feedbackRepository.find({ relations: ['course'] });
  }

  async findOne(id: string) {
    return await this.feedbackRepository.findOne({
      where: { id },
      relations: ['course'],
    });
  }

  update(id: number, updateFeedbackInput: UpdateFeedbackInput) {
    return `This action updates a #${id} feedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} feedback`;
  }
}
