import { Field, InputType } from "type-graphql";

@InputType()
class CreateQuestionInput {
  @Field()
  description: string;

  @Field((_type) => [String], { nullable: true })
  imageUrls?: string[];
}

export { CreateQuestionInput };
