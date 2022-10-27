import Group from "../../../entities/Tresure Hunt/Group";
import { Field, ObjectType } from "type-graphql";
import Question from "../../../entities/Tresure Hunt/Question";

@ObjectType()
class GetGroupOutput {
  @Field(() => Group)
  group: Group;

  @Field(() => [Question], { nullable: true })
  questions: Question[];
}

export default GetGroupOutput;
