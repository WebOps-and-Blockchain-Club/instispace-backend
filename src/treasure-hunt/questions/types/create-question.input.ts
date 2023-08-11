import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateQuestionInput {
  @Field()
  description: string;

  @Field((_type) => [String], { nullable: true })
  imageUrls?: string[];
}
