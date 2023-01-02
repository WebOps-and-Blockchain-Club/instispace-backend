import { Field, InputType } from "type-graphql";

@InputType()
class CreateGroupInput {
  @Field()
  name: string;
}

export { CreateGroupInput };
