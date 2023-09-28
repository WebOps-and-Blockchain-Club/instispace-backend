import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateFeedbackInput {
  @Field()
  review: string;

  @Field()
  profName: string;

  @Field(() => Int)
  rating: number;

  @Field()
  courseCode: string;

  @Field()
  courseName: string;

  


}
