import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.entity';
import { CreateFeedbackInput } from './type/create-feedback.input';
import { UpdateFeedbackInput } from './type/update-feedback.input';
import { Course } from '../course.entity';

@Resolver(() => Feedback)
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Mutation(() => Feedback)
  addFeedback(
    @Args('createFeedbackInput') createFeedbackInput: CreateFeedbackInput,
  ) {
    return this.feedbackService.create(createFeedbackInput);
  }

  @Query(() => [Feedback])
  findAll() {
    return this.feedbackService.findAll();
  }

  @Query(() => Feedback)
  async findOne(@Args('id') id: string) {
    return await this.feedbackService.findOne(id);
  }

  @Mutation(() => Feedback)
  updateFeedback(
    @Args('updateFeedbackInput') updateFeedbackInput: UpdateFeedbackInput,
  ) {
    return this.feedbackService.update(
      updateFeedbackInput.id,
      updateFeedbackInput,
    );
  }

  @ResolveField(() => Course)
  async course(@Parent() feedback: Feedback) {
    let courseN = await this.feedbackService.findOne(feedback.id);
    return feedback.course;
  }
}
