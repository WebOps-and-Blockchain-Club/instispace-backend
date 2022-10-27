import Group from "../../../entities/tresure_hunt/Group";
import { Field, ObjectType } from "type-graphql";
import Question from "../../../entities/tresure_hunt/Question";

@ObjectType()
class GetGroupOutput {
  @Field(() => Group)
  group: Group;

  @Field(() => [Question], { nullable: true })
  questions: Question[];

  @Field(() => Date)
  startTime: Date;

  @Field(() => Date)
  endTime: Date;
}

export default GetGroupOutput;
