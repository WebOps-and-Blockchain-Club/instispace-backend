import { Injectable } from '@nestjs/common';
import { CreateQuestionInput } from './types/create-question.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';


@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question) private questionRepository: Repository<Question>
  ){}
  async create(questionInput:CreateQuestionInput){
    try {
      let images;
      if (questionInput.imageUrls) {
        images = questionInput.imageUrls.join(" AND ");
      }
      // const questionCreated = await Question.create({
      //   description: questionInput.description,
      //   images: images === "" ? null : images,
      // }).save();
      const questionCreated=await this.questionRepository.save({
        description: questionInput.description,
        images: images === "" ? null : images
      })
      return questionCreated;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
