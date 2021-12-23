import { Field, InputType } from "type-graphql";

@InputType()
class CreateSecInput {
  @Field()
  roll: string;
}

@InputType()
class CreateHostelInput {
  @Field()
  name: string;
}

export {
    CreateHostelInput,
    CreateSecInput
}