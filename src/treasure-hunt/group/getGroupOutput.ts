import { Field, ObjectType } from "@nestjs/graphql";
import { Group } from "./group.entity";
import { Question } from "../questions/question.entity";

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

  @Field(() => Number)
  minMembers: number;

  @Field(() => Number)
  maxMembers: number;
}

export default GetGroupOutput;