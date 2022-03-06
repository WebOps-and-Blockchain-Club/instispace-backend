import { Field, InputType } from "type-graphql";

@InputType()
class AddFeedbackInput {
  @Field((_type) => Number)
  rating1: number;

  @Field((_type) => Number)
  rating2: number;

  @Field((_type) => Number)
  rating3: number;

  @Field({ nullable: true })
  ans1: string;

  @Field({ nullable: true })
  ans2: string;

  @Field({ nullable: true })
  ans3: string;
}

export default AddFeedbackInput;
