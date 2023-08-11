import { Resolver, Mutation, Args, ResolveField } from '@nestjs/graphql';
import { QuestionsService } from './questions.service';
import { Question } from './question.entity';
import { CreateQuestionInput } from './types/create-question.input';
import { UserService } from 'src/user/user.service';
import { Submission } from '../submissions/submission.entity';


@Resolver(() => Question)
export class QuestionsResolver {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly userServive: UserService,
    ) {}
  @Mutation(()=>Question)
  async createQuestion( @Args("QuestionData") questionInput: CreateQuestionInput){
    return await this.questionsService.create(questionInput);
  }
}
