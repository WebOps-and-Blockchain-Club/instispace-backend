import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from './submission.entity';
import { Repository } from 'typeorm';
import { Args } from '@nestjs/graphql';
import { CreateSubmissionInput } from './types/create-submission.input';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { QuestionsService } from '../questions/questions.service';
import { ConfigService } from '../config/config.service';
import { GroupService } from '../group/group.service';

// import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userServive: UserService,
    private readonly questionService: QuestionsService,
    private readonly groupService: GroupService,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
  ) {}

  async addSubmission(
    user: User,
    submissionInput: CreateSubmissionInput,
    questionId: string,
  ) {
    console.log(submissionInput);
    try {
      // contraints
      const startTime = await this.configService.findItemBYKey('startTime');
      const endTime = await this.configService.findItemBYKey('endTime');
      // const maxMembers=await this.configService.findItemBYKey('maxMembers');
      const minMembers = await this.configService.findItemBYKey('minMembers');

      const d = new Date();
      if (
        d.getTime() < new Date(startTime!.value).getTime() ||
        d.getTime() > new Date(endTime!.value).getTime()
      ) {
        throw new Error('Invalid Time');
      }

      let newUser = await this.userServive.getOneById(user.id, [
        'group',
        'group.users',
      ]);
      const group = newUser.group;
      if (!group) throw new Error('Unregistered');

      //finding question
      const question = await this.questionService.findQuestionById(questionId);
      if (question?.submissions.filter((s) => s.group.id === group.id).length) {
        throw new Error('Already answered');
      }

      let images;
      if (submissionInput.imageUrls) {
        images = submissionInput.imageUrls.join(' AND ');
      }
      let submission = new Submission();
      submission.description = submissionInput.description;
      submission.images = images;
      submission.group = group;
      submission.question = question;
      submission.submittedBy = user;

      return await this.submissionRepository.save(submission);
    } catch (error) {
      throw new Error(error);
    }
  }

  async findSubmissionById(id: string) {
    return await this.submissionRepository.findOne({
      where: { id },
      relations: ['question', 'group'],
    });
  }

  async removeSubmission(questionId: string, user: User) {
    console.log(questionId, user);
    const userN = await this.userServive.getOneById(user.id, ['group']);
    const group = await this.groupService.findGroup(userN.group.id);

    let submission = group.submissions.filter(
      (sub) => sub.question.id == questionId,
    )[0];

    let subN = await this.findSubmissionById(submission.id);

    (subN.group = null), (subN.question = null);

    let new_sub = await this.submissionRepository.save(subN);

    return !!new_sub;
  }
}
