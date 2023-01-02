import { Field, InputType } from "type-graphql";

@InputType()
class CreateSubmissionInput {
  @Field()
  description: string;

  @Field((_type) => [String], { nullable: true })
  imageUrls?: string[];
}

export { CreateSubmissionInput };
