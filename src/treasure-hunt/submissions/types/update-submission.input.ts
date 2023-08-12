import { CreateSubmissionInput } from './create-submission.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSubmissionInput extends PartialType(CreateSubmissionInput) {
  @Field()
  description: string;

  @Field((_type) => [String], { nullable: true })
  imageUrls?: string[];
}
