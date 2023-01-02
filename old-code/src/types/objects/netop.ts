import Netop from "../../entities/Netop";
import { Field, ObjectType } from "type-graphql";

@ObjectType("getNetopOutput", { description: "Output type for getNetop query" })
class getNetopOutput {
  @Field(() => [Netop], { nullable: true })
  netopList: Netop[];

  @Field(() => Number)
  total: number;
}

export default getNetopOutput;
