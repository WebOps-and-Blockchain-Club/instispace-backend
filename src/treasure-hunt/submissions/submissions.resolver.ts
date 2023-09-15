import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SubmissionsService } from './submissions.service';
import { Submission } from './submission.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current_user';
import { CreateSubmissionInput } from './types/create-submission.input';
import { User } from 'src/user/user.entity';

@Resolver(() => Submission)
export class SubmissionsResolver {
  constructor(private readonly submissionsService: SubmissionsService) {}
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Submission)
  async addSubmissions(
    @CurrentUser() user: User,
    @Args('SubmissionData') submissionInput: CreateSubmissionInput,
    @Args('QuestionId') questionId: string,
  ) {
    return await this.submissionsService.addSubmission(
      user,
      submissionInput,
      questionId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async removeSubmission(
    @CurrentUser() user: User,
    @Args('QuestionId') questionId: string,
  ) {
    return await this.submissionsService.removeSubmission(questionId, user);
  }
}
