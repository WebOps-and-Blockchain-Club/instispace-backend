import { Department, PollType } from "../../utils";
import { Field, InputType } from "type-graphql";

@InputType({ description: "Input for create Poll mutation" })
class CreatePollInput {
  @Field({ description: "Question for the poll" })
  question: string;

  @Field((_type) => [String], { description: "Options for the Poll" })
  options: string[];

  @Field((_type) => Number, { description: "Duration for the Poll" })
  duration: number;

  @Field((_type) => Department, {
    nullable: true,
    description: "Department for which the Poll is being created",
  })
  department?: Department;

  @Field((_type) => [String], {
    nullable: true,
    description: "Batch for which the Poll is being Created",
  })
  batch?: string[];

  @Field({ description: "Describes whether the poll is sigle or multi" })
  pollType: PollType;
}

export default CreatePollInput;
