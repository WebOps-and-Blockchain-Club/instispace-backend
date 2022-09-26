import MyQuery from "../../entities/MyQuery";
import Netop from "../../entities/Netop";
import { ObjectType, Field } from "type-graphql";

@ObjectType("GetReportsOutput")
class GetReportsOutput {
  @Field(() => [Netop], { nullable: true })
  netops: Netop[];

  @Field(() => [MyQuery], { nullable: true })
  queries: MyQuery[];
}

export { GetReportsOutput };
