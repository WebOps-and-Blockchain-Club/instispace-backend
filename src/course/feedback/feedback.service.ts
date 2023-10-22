 import { Injectable } from '@nestjs/common';
import { CreateFeedbackInput } from './type/create-feedback.input';
import { UpdateFeedbackInput } from './type/update-feedback.input';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    // private readonly courseService: CourseService,
  ) {}
  async create(createFeedbackInput: CreateFeedbackInput , user:User) {
    let feedback = this.feedbackRepository.create({ ...createFeedbackInput });
    feedback.createdBy=user;
    // let course = await this.courseService.findOneByCode(
    //   createFeedbackInput.courseCode,
    // );
    // console.log(course);
    // feedback.course = course;
    return await this.feedbackRepository.save(feedback);
  }

  async findAll(search : string) {
    let list= await this.feedbackRepository.find({order: { createdAt:"DESC" },relations:['createdBy']});
    if(search && search.length)
    list= list.filter((e)=>JSON.stringify(e)
    .toLowerCase()
    .includes(search?.toLowerCase()!))
    return list;
  }

  async findOne(id: string) {
    return await this.feedbackRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  update(id: number, updateFeedbackInput: UpdateFeedbackInput) {
    return `This action updates a #${id} feedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} feedback`;
  }
}
