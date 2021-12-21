import Netop from "../../entities/Netop";
import { Field, ObjectType } from "type-graphql";

@ObjectType("getNetopOutput")
class getNetopOutput {
  @Field(() => [Netop], { nullable: true })
  netopList: Netop[];

  @Field(() => Number)
  total: number;
}

export default getNetopOutput;
