import Item from "../../entities/Item";
import { Field, ObjectType } from "type-graphql";

@ObjectType("getItemsOutput", { description: "Output type for getItems query" })
class getItemsOutput {
  @Field(() => [Item], { nullable: true })
  itemsList: Item[];

  @Field(() => Number)
  total: number;
}

export default getItemsOutput;
