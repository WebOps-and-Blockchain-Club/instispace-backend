import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SubmissionsService } from './submissions.service';
import { Submission } from './submission.entity';

@Resolver(() => Submission)
export class SubmissionsResolver {
  constructor(private readonly submissionsService: SubmissionsService) {}

}
