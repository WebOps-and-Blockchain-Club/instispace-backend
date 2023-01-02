import Query from "../../entities/MyQuery";
import { Field, ObjectType } from "type-graphql";

@ObjectType("getQueryOutput", {
  description: "Output type for getQuery query",
})
class getQueryOutput {
  @Field(() => [Query], { nullable: true })
  queryList: Query[];

  @Field(() => Number)
  total: number;
}

export default getQueryOutput;
