import Event from "../../entities/Event";
import { Field, ObjectType } from "type-graphql";

@ObjectType("getEventOutput")
class getEventOutput {
  @Field(() => [Event], { nullable: true })
  list: Event[];

  @Field(() => Number)
  total: number;
}

export default getEventOutput;
