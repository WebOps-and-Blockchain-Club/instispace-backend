import Group from "../../../entities/tresure_hunt/Group";
import { Field, ObjectType } from "type-graphql";
import Question from "../../../entities/tresure_hunt/Question";

@ObjectType()
class GetGroupOutput {
  @Field(() => Group)
  group: Group;

  @Field(() => [Question], { nullable: true })
  questions: Question[];

  @Field()
  startTime: string;

  @Field()
  endTime: string;
}

export default GetGroupOutput;
