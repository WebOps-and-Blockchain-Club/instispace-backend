import { Resolver, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { QuestionsService } from './questions.service';
import { Question } from './question.entity';
import { CreateQuestionInput } from './types/create-question.input';
import { UserService } from 'src/user/user.service';
import { Submission } from '../submissions/submission.entity';
import { CurrentUser } from 'src/auth/current_user';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.entity';


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

  @UseGuards(JwtAuthGuard)
  @ResolveField(()=>Submission,{nullable:true})
  async submission(@CurrentUser() user:User,@Parent() question:Question ) {
    try {
      let newUser=await this.userServive.getOneById(user.id,['group'])
      let newQuestion = await this.questionsService.findQuestionById(question.id)
      return newQuestion!.submissions.filter((s)=>s.group.id===newUser.group.id)[0];
    } catch (error) {
      throw new Error(error)
    }
  }
}
