import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from './submission.entity';
import { Repository } from 'typeorm';
import { Args } from '@nestjs/graphql';
import { CreateSubmissionInput } from './types/create-submission.input';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly userServive: UserService,  
    private readonly questionService:QuestionsService,
    @InjectRepository(Submission) private submissionRepository: Repository<Submission>
  ){}

  async addSubmission(
    user:User,
    submissionInput:CreateSubmissionInput,
    questionId:string
  ){
    let newUser=await this.userServive.getOneById(user.id,['group','group.users']);
    const group=user.group;
    if(!group) throw new Error("Unregistered");
    const question=await this.questionService.findQuestionById(questionId);
    if (question?.submissions.filter((s) => s.group.id === group.id).length) {
        throw new Error("Already answered");
      }
    
      let images;
      if (submissionInput.imageUrls) {
        images = submissionInput.imageUrls.join(" AND ");
      }
      let submission=new Submission()
      submission.description=submissionInput.description;
      submission.images=images;
      submission.group=group;
      submission.question=question;
      submission.submittedBy=user;

      return await this.submissionRepository.save(submission);
  }

}
