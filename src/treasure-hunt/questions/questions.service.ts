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
      let questionCreated= new Question();
      questionCreated.images=images==="" ? null : images;
      questionCreated.description=questionInput.description;
     
      return await this.questionRepository.save(questionCreated);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async findQuestionById(questionId:string){
    return await this.questionRepository.findOne({where:{id:questionId},relations:['submissions',"submissions.submittedBy","submissions.group",]})
  }

  async findAllQuestion(){
    return await this.questionRepository.find({relations:['submissions']});
  }
}
