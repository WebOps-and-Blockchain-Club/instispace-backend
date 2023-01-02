import { Field, InputType } from "type-graphql";

@InputType({ description: "Input-Type for Create-Report-Reason Mutation" })
class ReasonInput {
  @Field({ description: "Reason for the post bieng reported" })
  reason: string;

  @Field((_type) => Number, { description: "Count Limit", nullable: true })
  count: number;
}

export default ReasonInput;
