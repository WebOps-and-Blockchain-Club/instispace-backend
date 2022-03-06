import { Field, InputType } from "type-graphql";

@InputType()
class AddFeedbackInput {
  @Field({ nullable: true })
  ans1: string;

  @Field({ nullable: true })
  ans2: string;

  @Field({ nullable: true })
  ans3: string;
}

export default AddFeedbackInput;
