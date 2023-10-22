import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.entity';
import { CreateFeedbackInput } from './type/create-feedback.input';
import { UpdateFeedbackInput } from './type/update-feedback.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current_user';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Resolver(() => Feedback)
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService,private readonly userService : UserService
    ) {}


  @UseGuards(JwtAuthGuard)
  @Mutation(() => Feedback)
  async addFeedback(
    @Args('createFeedbackInput') createFeedbackInput: CreateFeedbackInput,
    @CurrentUser() user:User,
  ) {
    let newUser=await this.userService.getOneById(user.id,['courseFeedback'])
    return await this.feedbackService.create(createFeedbackInput,newUser);
  }

  @Query(() => [Feedback])
  async findAllFeedback(@Args('search') search:string) {
    return await  this.feedbackService.findAll(search);
  }

  @Query(() => Feedback)
  async findOneFeedback(@Args('id') id: string) {
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

  @ResolveField(() => User)
  async createdBy(@Parent() feedback:Feedback) {
    let newFeedback = await this.feedbackService.findOne(feedback.id);
    return newFeedback.createdBy;
  }

  // @ResolveField(() => Course)
  // async course(@Parent() feedback: Feedback) {
  //   let courseN = await this.feedbackService.findOne(feedback.id);
  //   return feedback.course;
  // }
}
